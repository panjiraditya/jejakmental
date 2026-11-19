import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class BookingStatus(str, enum.Enum):
    pending = "pending"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"
    # Pemesanan ganda untuk tanggal + slot yang sama dicegah di level database
    # (NFR-06). Booking yang dibatalkan tetap tersimpan sebagai riwayat.
    __table_args__ = (
        UniqueConstraint("user_id", "slot_id", "slot_date", name="uq_booking_user_slot_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    facility_id: Mapped[int] = mapped_column(ForeignKey("facilities.id"), nullable=False, index=True)
    slot_id: Mapped[int] = mapped_column(ForeignKey("schedule_slots.id"), nullable=False, index=True)
    slot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus), default=BookingStatus.pending, nullable=False
    )
    code: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Demo: tim internal menghubungi pengguna untuk konfirmasi. Belum ada
    # integrasi dengan faskes, jadi status tidak pernah berubah menjadi
    # "terkonfirmasi" secara otomatis.
    follow_up_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship()  # noqa: F821
    facility: Mapped["Facility"] = relationship()  # noqa: F821
    slot: Mapped["ScheduleSlot"] = relationship(back_populates="bookings")  # noqa: F821
