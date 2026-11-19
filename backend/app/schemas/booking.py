from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.booking import BookingStatus
from app.schemas.base import ORMModel
from app.schemas.facility import FacilityOut, SlotOut


class BookingIn(BaseModel):
    slot_id: int
    slot_date: date
    notes: str | None = Field(default=None, max_length=500)
    contact_phone: str | None = Field(default=None, max_length=30)


class BookingOut(ORMModel):
    id: int
    code: str
    status: BookingStatus
    slot_date: date
    notes: str | None
    contact_phone: str | None
    follow_up_note: str | None
    created_at: datetime
    facility: FacilityOut | None = None
    slot: SlotOut | None = None


class DayAvailability(BaseModel):
    date: date
    slots: list[SlotOut]
