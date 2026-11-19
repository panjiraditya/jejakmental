from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_optional_user, require_admin
from app.db.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.facility import Facility
from app.models.schedule import ScheduleSlot
from app.models.screening import Screening
from app.models.user import User
from app.schemas.facility import FacilityWrite, SlotOut, SlotWrite
from app.services.format import serialize_facility, serialize_slot, split_pipe

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return {
        "facilities": db.query(func.count(Facility.id)).scalar(),
        "published": db.query(func.count(Facility.id)).filter(Facility.is_published.is_(True)).scalar(),
        "unverified": db.query(func.count(Facility.id)).filter(Facility.is_verified.is_(False)).scalar(),
        "bookings_pending": db.query(func.count(Booking.id))
        .filter(Booking.status == BookingStatus.pending)
        .scalar(),
        "users": db.query(func.count(User.id)).scalar(),
        "screenings": db.query(func.count(Screening.id)).scalar(),
    }


@router.get("/facilities")
def admin_facilities(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.query(Facility).order_by(Facility.name).all()
    return [serialize_facility(f) for f in rows]


def _apply(facility: Facility, payload: FacilityWrite) -> None:
    data = payload.model_dump(exclude_unset=True)
    if "services" in data and data["services"] is not None:
        data["services"] = "|".join(split_pipe("|".join(data["services"])))
    if "age_groups" in data and data["age_groups"] is not None:
        data["age_groups"] = "|".join(split_pipe("|".join(data["age_groups"])))
    if data.get("slug") is None:
        data.pop("slug", None)
    for key, value in data.items():
        setattr(facility, key, value)


@router.post("/facilities", status_code=status.HTTP_201_CREATED)
def create_facility(payload: FacilityWrite, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if not payload.name or not payload.slug or not payload.kind or not payload.summary or not payload.address:
        raise HTTPException(status_code=400, detail="Nama, slug, jenis, ringkasan, dan alamat wajib diisi.")
    if db.query(Facility).filter(Facility.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Slug sudah dipakai.")
    facility = Facility(
        slug=payload.slug,
        name=payload.name,
        kind=payload.kind,
        summary=payload.summary,
        address=payload.address,
        services="",
        age_groups="Dewasa",
    )
    _apply(facility, payload)
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return serialize_facility(facility)


@router.patch("/facilities/{facility_id}")
def update_facility(
    facility_id: int, payload: FacilityWrite, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    facility = db.get(Facility, facility_id)
    if not facility:
        raise HTTPException(status_code=404, detail="Entri tidak ditemukan.")
    _apply(facility, payload)
    facility.reviewed_on = datetime.now(timezone.utc)
    db.commit()
    db.refresh(facility)
    return serialize_facility(facility)


@router.delete("/facilities/{facility_id}", status_code=204)
def delete_facility(facility_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    facility = db.get(Facility, facility_id)
    if not facility:
        raise HTTPException(status_code=404, detail="Entri tidak ditemukan.")
    db.delete(facility)
    db.commit()


@router.get("/facilities/{facility_id}/slots", response_model=list[SlotOut])
def admin_slots(facility_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    slots = (
        db.query(ScheduleSlot)
        .filter(ScheduleSlot.facility_id == facility_id)
        .order_by(ScheduleSlot.weekday, ScheduleSlot.start_time)
        .all()
    )
    return [serialize_slot(s) for s in slots]


@router.post("/facilities/{facility_id}/slots", response_model=SlotOut, status_code=201)
def create_slot(
    facility_id: int, payload: SlotWrite, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    facility = db.get(Facility, facility_id)
    if not facility:
        raise HTTPException(status_code=404, detail="Entri tidak ditemukan.")
    if payload.weekday is None or not payload.start_time or not payload.end_time:
        raise HTTPException(status_code=400, detail="Hari, jam mulai, dan jam selesai wajib diisi.")
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="Jam selesai harus setelah jam mulai.")
    slot = ScheduleSlot(
        facility_id=facility_id,
        weekday=payload.weekday,
        start_time=payload.start_time,
        end_time=payload.end_time,
        label=payload.label,
        room=payload.room,
        capacity=payload.capacity or 1,
        mode=payload.mode or "call_to_book",
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return serialize_slot(slot)


@router.patch("/slots/{slot_id}", response_model=SlotOut)
def update_slot(slot_id: int, payload: SlotWrite, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    slot = db.get(ScheduleSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(slot, key, value)
    if slot.end_time <= slot.start_time:
        raise HTTPException(status_code=400, detail="Jam selesai harus setelah jam mulai.")
    db.commit()
    db.refresh(slot)
    return serialize_slot(slot)


@router.delete("/slots/{slot_id}", status_code=204)
def delete_slot(slot_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    slot = db.get(ScheduleSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan.")
    db.delete(slot)
    db.commit()


@router.get("/bookings")
def admin_bookings(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.query(Booking).order_by(Booking.created_at.desc()).all()
    out = []
    for b in rows:
        out.append(
            {
                "id": b.id,
                "code": b.code,
                "status": b.status,
                "slot_date": b.slot_date,
                "created_at": b.created_at,
                "facility": b.facility.name if b.facility else "",
                "facility_slug": b.facility.slug if b.facility else "",
                "slot": f"{b.slot.label or ''} {b.slot.start_time}".strip() if b.slot else "",
                # Data pribadi ditampilkan seminimal mungkin; tanpa jawaban skrining.
                "contact": b.contact_phone or "-",
                "user_ref": f"U{b.user_id:04d}",
            }
        )
    return out


@router.post("/bookings/{booking_id}/cancel")
def admin_cancel_booking(booking_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    booking.status = BookingStatus.cancelled
    db.commit()
    return {"status": "cancelled"}
