from contextlib import contextmanager
from datetime import date, datetime, timedelta, timezone

from app.core.config import settings
from app.db.seed_data import (
    DEMO_SLOTS,
    EMERGENCY_CONTACTS,
    FACILITIES,
    WHO5_OPTIONS,
    WHO5_QUESTIONS,
)

SEED_VERSION = "2026-10-25.1"


@contextmanager
def startup_data():
    """Isi database kosong secara idempoten.

    Dev lokal memakai SQLite, produksi PostgreSQL. Tabel dibuat otomatis dan
    seed hanya berjalan bila direktori masih kosong.
    """
    from app.db.session import Base, SessionLocal, engine
    import app.models  # noqa: F401  (registrasi semua model)

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from app.models.facility import Facility
        from app.models.question import Question
        from app.models.schedule import ScheduleSlot, SlotMode
        from app.models.user import Role, User

        if db.query(Facility).count() == 0:
            for item in FACILITIES:
                data = dict(item)
                slots = data.pop("slots", [])
                facility = Facility(**data, reviewed_on=_reviewed())
                db.add(facility)
                db.flush()
                for s in slots:
                    db.add(ScheduleSlot(facility_id=facility.id, **s))
                if settings.demo_schedule_enabled:
                    for demo in DEMO_SLOTS:
                        if demo["facility"] != facility.slug:
                            continue
                        db.add(
                            ScheduleSlot(
                                facility_id=facility.id,
                                weekday=demo["weekday"],
                                start_time=demo["start_time"],
                                end_time=demo["end_time"],
                                label=demo["label"],
                                capacity=demo["capacity"],
                                mode=SlotMode(demo["mode"]),
                                is_active=True,
                            )
                        )

        if db.query(Question).count() == 0:
            for pos, text in enumerate(WHO5_QUESTIONS):
                db.add(Question(instrument="who5", position=pos, text=text))

        from app.core.security import hash_password

        seeds = [
            ("Admin JejakMental", "admin@jejakmental.id", "admin123", Role.admin),
            ("Demo Pengguna", "demo@jejakmental.id", "demo1234", Role.patient),
        ]
        for name, email, password, role in seeds:
            if not db.query(User).filter(User.email == email).first():
                db.add(User(name=name, email=email, hashed_password=hash_password(password), role=role))

        db.commit()
    finally:
        db.close()

    yield


def _reviewed() -> datetime:
    value = settings.data_reviewed_on
    return datetime.combine(value, datetime.min.time()).replace(tzinfo=timezone.utc)


def weekday_occurrence(weekday: int, weeks_ahead: int = 0, start: date | None = None) -> date:
    today = start or date.today()
    delta = (weekday - today.weekday()) % 7
    return today + timedelta(days=delta + 7 * weeks_ahead)
