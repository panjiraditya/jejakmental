from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.facility import FacilityKind
from app.models.schedule import SlotMode
from app.schemas.base import ORMModel


class FacilityOut(ORMModel):
    id: int
    slug: str
    name: str
    kind: FacilityKind
    summary: str
    address: str
    district: str | None
    phone: str | None
    whatsapp: str | None
    website: str | None
    services: list[str]
    age_groups: list[str]
    cost_note: str | None
    cost_min: int | None
    cost_max: int | None
    accepts_bpjs: bool | None
    emergency_24h: bool
    online_available: bool
    opening_note: str | None
    online_note: str | None
    access_note: str | None
    is_verified: bool
    source_url: str | None
    reviewed_on: date | None
    next_available: date | None = None


class SlotOut(ORMModel):
    id: int
    facility_id: int
    weekday: int
    start_time: str
    end_time: str
    label: str | None
    room: str | None
    capacity: int
    taken: int = 0
    mode: SlotMode
    is_active: bool


class FacilityListMeta(BaseModel):
    total: int
    reviewed_on: date


class FacilityList(BaseModel):
    items: list[FacilityOut]
    meta: FacilityListMeta


class FacilityWrite(BaseModel):
    slug: str | None = Field(default=None, max_length=120)
    name: str | None = None
    kind: FacilityKind | None = None
    summary: str | None = None
    address: str | None = None
    district: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    website: str | None = None
    services: list[str] | None = None
    age_groups: list[str] | None = None
    cost_note: str | None = None
    cost_min: int | None = None
    cost_max: int | None = None
    accepts_bpjs: bool | None = None
    emergency_24h: bool | None = None
    online_available: bool | None = None
    opening_note: str | None = None
    online_note: str | None = None
    access_note: str | None = None
    is_verified: bool | None = None
    is_published: bool | None = None
    source_url: str | None = None


class SlotWrite(BaseModel):
    weekday: int | None = Field(default=None, ge=0, le=6)
    start_time: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    end_time: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    label: str | None = None
    room: str | None = None
    capacity: int | None = Field(default=None, ge=1, le=50)
    mode: SlotMode | None = None
    is_active: bool | None = None
