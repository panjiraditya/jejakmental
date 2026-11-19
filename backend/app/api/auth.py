from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import Role, User
from app.schemas.user import LoginIn, ProfileUpdate, RegisterIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_MAX_AGE = settings.session_hours * 3600


def _set_session_cookie(response: Response, user: User) -> None:
    # Sesi disimpan di cookie HttpOnly sehingga token tidak dapat dibaca skrip
    # pihak ketiga (NFR-01/02).
    response.set_cookie(
        key=settings.cookie_name,
        value=create_access_token(user.id),
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, response: Response, db: Session = Depends(get_db)):
    if not payload.accept_terms:
        raise HTTPException(status_code=400, detail="Setujui catatan privasi terlebih dahulu.")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email ini sudah terdaftar. Coba masuk saja.")
    user = User(
        name=payload.name,
        email=payload.email.lower(),
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=Role.patient,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_session_cookie(response, user)
    return user


@router.post("/login", response_model=UserOut)
def login(payload: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau kata sandi tidak cocok.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun ini sedang tidak aktif.")
    _set_session_cookie(response, user)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(settings.cookie_name, path="/")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.name is not None:
        user.name = payload.name
    if payload.phone is not None:
        user.phone = payload.phone
    db.commit()
    db.refresh(user)
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(response: Response, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Hak atas data sendiri. Booking dan skrining ikut terhapus."""
    db.query(User).filter(User.id == user.id).delete()
    db.commit()
    response.delete_cookie(settings.cookie_name, path="/")
