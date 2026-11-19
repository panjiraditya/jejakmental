from datetime import datetime

from pydantic import BaseModel

from app.schemas.base import ORMModel


class OptionOut(BaseModel):
    value: int
    label: str


class QuestionOut(BaseModel):
    id: int
    position: int
    text: str


class ScreeningForm(BaseModel):
    instrument: str
    title: str
    intro: str
    timeframe: str
    disclaimer: str
    source: str
    options: list[OptionOut]
    questions: list[QuestionOut]


class ScreeningIn(BaseModel):
    instrument: str = "who5"
    # posisi butir -> nilai 0..4
    answers: dict[int, int]
    save: bool = False


class ScreeningOut(ORMModel):
    id: int
    instrument: str
    score: int
    level: str
    created_at: datetime


class ScreeningResult(BaseModel):
    score: int
    level: str
    headline: str
    meaning: str
    suggestions: list[str]
    disclaimer: str
    saved: bool
    screening_id: int | None = None
