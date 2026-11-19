import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db.seed_data import DEMO_SLOTS, FACILITIES, REVIEWED_ON, WHO5_QUESTIONS  # noqa: E402
from app.db.session import Base, SessionLocal, engine  # noqa: E402
from app.models import Booking, Facility, Question, Role, ScheduleSlot, SlotMode, User  # noqa: E402


def seed(force: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Facility).count() > 0 and not force:
            print("Data sudah ada. Gunakan --force untuk menulis ulang.")
            return

        if force:
            db.query(Booking).delete()
            db.query(ScheduleSlot).delete()
            db.query(Facility).delete()
            db.query(Question).delete()
            db.commit()

        reviewed = datetime.fromisoformat(REVIEWED_ON)

        for item in FACILITIES:
            data = dict(item)
            slots = data.pop("slots", [])
            facility = Facility(**data, reviewed_on=reviewed)
            db.add(facility)
            db.flush()
            for s in slots:
                db.add(ScheduleSlot(facility_id=facility.id, **s))

        if settings.demo_schedule_enabled:
            for demo in DEMO_SLOTS:
                facility = db.query(Facility).filter(Facility.slug == demo["facility"]).first()
                if not facility:
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

        for pos, text in enumerate(WHO5_QUESTIONS):
            db.add(Question(instrument="who5", position=pos, text=text))

        users = [
            ("Admin JejakMental", "admin@jejakmental.id", "admin123", Role.admin),
            ("Demo Pengguna", "demo@jejakmental.id", "demo1234", Role.patient),
        ]
        for name, email, password, role in users:
            if not db.query(User).filter(User.email == email).first():
                db.add(
                    User(
                        name=name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )

        db.commit()
        print(
            f"Selesai. {db.query(Facility).count()} entri direktori, "
            f"{db.query(ScheduleSlot).count()} slot."
        )
        print("Admin   : admin@jejakmental.id / admin123")
        print("Pengguna: demo@jejakmental.id / demo1234")
    finally:
        db.close()


if __name__ == "__main__":
    seed(force="--force" in sys.argv)
