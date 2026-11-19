import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SlotMode(str, enum.Enum):
    """Ketersediaan sesungguhnya tidak dapat dipastikan lewat web.

    - `bookable`   : slot contoh/demo. Bisa dipesan di aplikasi, ditandai jelas
                     sebagai simulasi.
    - `call_to_book`: slot riil. Web hanya menampilkan pratinjau; pemesanan
                     dilakukan dengan menghubungi fasilitas sehingga tidak
                     pernah ada janji yang tidak bisa ditepati.
    """

    bookable = "bookable"
    call_to_book = "call_to_book"


class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    id: Mapped[int] = mapped_column(primary_key=True)
    facility_id: Mapped[int] = mapped_column(
        ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)  # 0 = Senin
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # "08:30"
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)
    label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    room: Mapped[str | None] = mapped_column(String(120), nullable=True)

    capacity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    mode: Mapped[SlotMode] = mapped_column(Enum(SlotMode), default=SlotMode.bookable, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    facility: Mapped["Facility"] = relationship(back_populates="slots")  # noqa: F821
    bookings: Mapped[list["Booking"]] = relationship(back_populates="slot")  # noqa: F821
