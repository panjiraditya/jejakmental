from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.question import Question
from app.models.screening import Screening
from app.models.user import User
from app.schemas.screening import ScreeningForm, ScreeningIn, ScreeningOut, ScreeningResult
from app.services.screening import DISCLAIMER, grading, score_who5, who5_options

router = APIRouter(prefix="/screening", tags=["screening"])

INSTRUMENTS = {
    "who5": {
        "title": "Bagaimana dua minggu terakhir Anda?",
        "intro": (
            "Lima pertanyaan singkat tentang kesejahteraan Anda. Tidak ada jawaban "
            "benar atau salah, dan tidak perlu menyelesaikannya bila terasa berat."
        ),
        "timeframe": "Pikirkan dua minggu terakhir.",
        "source": "WHO-5 Well-Being Index (World Health Organization)",
    }
}


@router.get("/form", response_model=ScreeningForm)
def form(instrument: str = Query(default="who5"), db: Session = Depends(get_db)):
    meta = INSTRUMENTS.get(instrument)
    if not meta:
        raise HTTPException(status_code=404, detail="Instrumen tidak tersedia.")
    questions = (
        db.query(Question)
        .filter(Question.instrument == instrument, Question.is_active.is_(True))
        .order_by(Question.position)
        .all()
    )
    return {
        "instrument": instrument,
        **meta,
        "disclaimer": DISCLAIMER,
        "options": who5_options(),
        "questions": [{"id": q.id, "position": q.position, "text": q.text} for q in questions],
    }


@router.post("", response_model=ScreeningResult)
def submit(
    payload: ScreeningIn,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    total_questions = (
        db.query(Question)
        .filter(Question.instrument == payload.instrument, Question.is_active.is_(True))
        .count()
    )
    if total_questions == 0:
        raise HTTPException(status_code=404, detail="Instrumen tidak tersedia.")
    if len(payload.answers) != total_questions:
        raise HTTPException(status_code=400, detail="Mohon jawab semua pertanyaan.")
    for value in payload.answers.values():
        if not 0 <= int(value) <= 4:
            raise HTTPException(status_code=400, detail="Nilai jawaban tidak valid.")

    score = score_who5(payload.answers)
    result = grading(score)

    saved_id = None
    if payload.save and user is not None:
        record = Screening(
            user_id=user.id,
            instrument=payload.instrument,
            answers={str(k): int(v) for k, v in payload.answers.items()},
            score=score,
            level=result["level"],
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        saved_id = record.id

    return {
        **result,
        "score": score,
        "disclaimer": DISCLAIMER,
        "saved": saved_id is not None,
        "screening_id": saved_id,
    }


@router.get("/mine", response_model=list[ScreeningOut])
def mine(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(Screening)
        .filter(Screening.user_id == user.id)
        .order_by(Screening.created_at.desc())
        .all()
    )


@router.delete("/{screening_id}", status_code=204)
def delete_one(screening_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = db.get(Screening, screening_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Hasil tidak ditemukan.")
    db.delete(row)
    db.commit()
