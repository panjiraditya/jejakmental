from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_optional_user, require_admin
from app.core.config import settings
from app.db.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.facility import Facility, FacilityKind
from app.models.schedule import ScheduleSlot, SlotMode
from app.models.user import User
from app.schemas.facility import (
    FacilityList,
    FacilityListMeta,
    FacilityOut,
    FacilityWrite,
    SlotOut,
    SlotWrite,
)
from app.services.format import parse_hm, serialize_facility, serialize_slot, split_pipe

router = APIRouter(tags=["directory"])


def _next_available(facility: Facility, today: date | None = None) -> date | None:
    today = today or date.today()
    dates = [s.weekday for s in facility.slots if s.is_active]
    if not dates:
        return None
    # Cari hingga 14 hari ke depan agar "hari ini" yang sudah lewat tetap aman.
    for offset in range(0, 15):
        candidate = today + timedelta(days=offset)
        if candidate.weekday() in dates:
            return candidate
    return None


def _get_facility(db: Session, slug: str) -> Facility:
    facility = db.query(Facility).filter(Facility.slug == slug).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Entri tidak ditemukan.")
    return facility


@router.get("/facilities", response_model=FacilityList)
def list_facilities(
    q: str | None = Query(default=None, max_length=80),
    kind: list[FacilityKind] | None = Query(default=None),
    district: str | None = Query(default=None),
    free: bool = Query(default=False, description="Hanya layanan tanpa biaya"),
    bpjs: bool = Query(default=False, description="Menerima BPJS"),
    online: bool = Query(default=False, description="Tersedia sesi daring"),
    emergency: bool = Query(default=False, description="IGD/layanan 24 jam"),
    online_available: bool = Query(default=False, alias="onlineAvailable"),
    sort: str = Query(default="relevance", pattern="^(relevance|name|available)$"),
    db: Session = Depends(get_db),
):
    query = db.query(Facility).filter(Facility.is_published.is_(True))

    if kind:
        query = query.filter(Facility.kind.in_(kind))
    if district:
        query = query.filter(Facility.district == district)
    if free:
        query = query.filter(Facility.cost_min == 0)
    if bpjs:
        query = query.filter(Facility.accepts_bpjs.is_(True))
    if online or online_available:
        query = query.filter(Facility.online_available.is_(True))
    if emergency:
        query = query.filter(Facility.emergency_24h.is_(True))
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Facility.name.ilike(like),
                Facility.summary.ilike(like),
                Facility.services.ilike(like),
                Facility.district.ilike(like),
                Facility.address.ilike(like),
            )
        )

    items = query.all()
    serialized = []
    for facility in items:
        data = serialize_facility(facility, _next_available(facility))
        # Kata kunci juga dicocokkan ke label layanan yang sudah dipisah.
        if q:
            needle = q.strip().lower()
            haystack = " ".join(
                [data["name"], data["summary"], data["district"] or "", " ".join(data["services"])]
            ).lower()
            if needle not in haystack:
                continue
        serialized.append(data)

    if sort == "name":
        serialized.sort(key=lambda x: x["name"].lower())
    elif sort == "available":
        serialized.sort(key=lambda x: (x["next_available"] is None, x["next_available"] or date.max))
    else:
        # Prioritas: biaya nol lebih dulu, lalu yang punya jadwal terdekat.
        serialized.sort(
            key=lambda x: (
                not (x["cost_min"] == 0),
                x["next_available"] is None,
                x["next_available"] or date.max,
                x["name"].lower(),
            )
        )

    return {
        "items": serialized,
        "meta": {"total": len(serialized), "reviewed_on": settings.data_reviewed_on},
    }


@router.get("/facilities/districts")
def list_districts(db: Session = Depends(get_db)):
    rows = (
        db.query(Facility.district)
        .filter(Facility.is_published.is_(True), Facility.district.isnot(None))
        .distinct()
        .all()
    )
    return sorted({r[0] for r in rows if r[0]})


@router.get("/facilities/{slug}", response_model=FacilityOut)
def get_facility(slug: str, db: Session = Depends(get_db)):
    facility = _get_facility(db, slug)
    if not facility.is_published:
        raise HTTPException(status_code=404, detail="Entri tidak ditemukan.")
    return serialize_facility(facility, _next_available(facility))


# ---------- Jadwal ----------


def _taken_map(db: Session, slot_ids: list[int], dates: list[date]) -> dict[tuple[int, date], int]:
    if not slot_ids or not dates:
        return {}
    rows = (
        db.query(Booking.slot_id, Booking.slot_date, Booking.id)
        .filter(
            Booking.slot_id.in_(slot_ids),
            Booking.slot_date.in_(dates),
            Booking.status == BookingStatus.pending,
        )
        .all()
    )
    counts: dict[tuple[int, date], int] = {}
    for slot_id, slot_date, _ in rows:
        key = (slot_id, slot_date)
        counts[key] = counts.get(key, 0) + 1
    return counts


@router.get("/facilities/{slug}/schedule", response_model=list[SlotOut])
def facility_schedule(slug: str, db: Session = Depends(get_db)):
    facility = _get_facility(db, slug)
    slots = [s for s in facility.slots if s.is_active]
    slots.sort(key=lambda s: (s.weekday, s.start_time))
    dates = [date.today() + timedelta(days=o) for o in range(0, 15)]
    taken = _taken_map(db, [s.id for s in slots], dates)
    today = date.today()
    result = []
    for slot in slots:
        next_date = next(
            (d for d in dates if d.weekday() == slot.weekday), None
        )
        result.append(serialize_slot(slot, taken.get((slot.id, next_date or today), 0)))
    return result


@router.get("/facilities/{slug}/availability")
def facility_availability(
    slug: str,
    days: int = Query(default=14, ge=1, le=60),
    db: Session = Depends(get_db),
):
    facility = _get_facility(db, slug)
    slots = [s for s in facility.slots if s.is_active]
    start = date.today()
    dates = [start + timedelta(days=o) for o in range(days)]
    taken = _taken_map(db, [s.id for s in slots], dates)

    out = []
    for day in dates:
        day_slots = []
        for slot in sorted(slots, key=lambda s: s.start_time):
            if slot.weekday != day.weekday():
                continue
            count = taken.get((slot.id, day), 0)
            data = serialize_slot(slot, count)
            data["remaining"] = max(0, slot.capacity - count)
            if slot.mode == SlotMode.bookable and data["remaining"] == 0:
                data["full"] = True
            day_slots.append(data)
        if day_slots:
            out.append({"date": day, "slots": day_slots})
    return out
