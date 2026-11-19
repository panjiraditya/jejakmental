from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Question(Base):
    """Butir kuesioner. Disimpan di DB agar dapat diperbarui admin tanpa deploy.

    Instrumen yang dipakai saat ini: WHO-5 Well-Being Index (5 butir, skor
    0-25). WHO-5 dapat dipakai bebas, bukan alat diagnosis, dan hanya
    menggambarkan kesejahteraan dua minggu terakhir.
    """

    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    instrument: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(String(300), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
