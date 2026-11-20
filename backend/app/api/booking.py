import secrets
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.facility import Facility
from app.models.schedule import ScheduleSlot, SlotMode
from app.models.user import User
from app.schemas.booking import BookingIn, BookingOut
from app.services.format import serialize_facility, serialize_slot

router = APIRouter(prefix="/bookings", tags=["bookings"])

FOLLOW_UP_NOTE = (
    "Permintaan ini tercatat di JejakMental sebagai simulasi. Tim kami akan "
    "menghubungi Anda untuk memastikan jadwal. Untuk kepastian tercepat, "
    "boleh juga menelepon fasilitas langsung."
)

ALREADY_BOOKED = (
    "Anda sudah punya permintaan untuk jadwal ini. Buka “Akun saya” untuk "
    "melihat atau membatalkannya, atau pilih jam dan tanggal lain."
)


def _code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "JM-" + "".join(secrets.choice(alphabet) for _ in range(6))


def _serialize(booking: Booking) -> dict:
    facility = serialize_facility(booking.facility) if booking.facility else None
    slot = serialize_slot(booking.slot) if booking.slot else None
    return {
        "id": booking.id,
        "code": booking.code,
        "status": booking.status,
        "slot_date": booking.slot_date,
        "notes": booking.notes,
        "contact_phone": booking.contact_phone,
        "follow_up_note": booking.follow_up_note,
        "created_at": booking.created_at,
        "facility": facility,
        "slot": slot,
    }


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    slot = db.get(ScheduleSlot, payload.slot_id)
    if not slot or not slot.is_active:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan.")
    if slot.mode != SlotMode.bookable:
        raise HTTPException(
            status_code=409,
            detail="Jadwal ini hanya pratinjau. Silakan hubungi fasilitas untuk memesan.",
        )
    if payload.slot_date < date.today():
        raise HTTPException(status_code=400, detail="Tanggal sudah lewat. Pilih tanggal lain.")
    if slot.weekday != payload.slot_date.weekday():
        raise HTTPException(status_code=400, detail="Jadwal tidak tersedia pada tanggal tersebut.")

    # Validasi ulang kuota tepat sebelum menyimpan (FR-06).
    taken = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.slot_id == slot.id,
            Booking.slot_date == payload.slot_date,
            Booking.status == BookingStatus.pending,
        )
        .scalar()
    )
    if taken >= slot.capacity:
        raise HTTPException(
            status_code=409,
            detail="Slot ini baru saja penuh. Silakan pilih jam atau tanggal lain.",
        )

    booking = Booking(
        user_id=user.id,
        facility_id=slot.facility_id,
        slot_id=slot.id,
        slot_date=payload.slot_date,
        status=BookingStatus.pending,
        code=_code(),
        notes=(payload.notes or None),
        contact_phone=payload.contact_phone or user.phone,
        follow_up_note=FOLLOW_UP_NOTE,
    )
    db.add(booking)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=ALREADY_BOOKED)
    db.refresh(booking)
    return _serialize(booking)


@router.get("", response_model=list[BookingOut])
def my_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(Booking)
        .options(joinedload(Booking.facility), joinedload(Booking.slot))
        .filter(Booking.user_id == user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_serialize(b) for b in rows]


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.get(Booking, booking_id)
    if not booking or booking.user_id != user.id:
        raise HTTPException(status_code=404, detail="Permintaan tidak ditemukan.")
    if booking.status == BookingStatus.cancelled:
        return _serialize(booking)
    booking.status = BookingStatus.cancelled
    db.commit()
    db.refresh(booking)
    return _serialize(booking)
