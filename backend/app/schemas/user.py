from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import Role
from app.schemas.base import ORMModel


class UserOut(ORMModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    role: Role
    created_at: datetime


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    # Pendaftaran diri sendiri tidak boleh memilih peran (NFR-01).
    accept_terms: bool = False


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    phone: str | None = Field(default=None, max_length=30)
