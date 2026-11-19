import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class FacilityKind(str, enum.Enum):
    hospital = "hospital"
    psychiatric_hospital = "psychiatric_hospital"
    clinic = "clinic"
    puskesmas = "puskesmas"
    practice = "practice"
    nonprofit = "nonprofit"


class Facility(Base):
    """Satu entri direktori.

    Bisa berupa fasilitas (RSUD, puskesmas, klinik) maupun praktik pribadi
    psikiater/psikolog. Setiap entri wajib punya `source_url` agar pengguna
    dapat memverifikasi sendiri datanya.
    """

    __tablename__ = "facilities"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[FacilityKind] = mapped_column(Enum(FacilityKind), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    district: Mapped[str | None] = mapped_column(String(80), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(40), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)

    services: Mapped[str] = mapped_column(Text, nullable=False)  # dipisah "|"
    age_groups: Mapped[str] = mapped_column(String(120), default="Dewasa", nullable=False)

    # Biaya. NULL berarti "belum dikonfirmasi", bukan "gratis".
    cost_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    cost_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cost_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    accepts_bpjs: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    emergency_24h: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    online_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    opening_note: Mapped[str | None] = mapped_column(String(200), nullable=True)
    online_note: Mapped[str | None] = mapped_column(String(200), nullable=True)
    access_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    reviewed_on: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    slots: Mapped[list["ScheduleSlot"]] = relationship(  # noqa: F821
        back_populates="facility", cascade="all, delete-orphan"
    )
