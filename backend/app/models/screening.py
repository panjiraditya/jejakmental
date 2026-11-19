from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Screening(Base):
    """Hasil skrining mandiri.

    Bila user login, hasil disimpan agar bisa dilihat kembali oleh pemiliknya
    saja. Skor disimpan sebagai angka dan level; jawaban per butir disimpan
    sebagai JSON untuk keperluan evaluasi, tidak pernah ditampilkan ke peran
    lain, termasuk admin (NFR-02).
    """

    __tablename__ = "screenings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    instrument: Mapped[str] = mapped_column(String(30), nullable=False, default="who5")
    answers: Mapped[dict] = mapped_column(JSON, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    level: Mapped[str] = mapped_column(String(30), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
