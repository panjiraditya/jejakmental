from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.core.config import settings
from app.db.session import get_db
from app.models.user import Role, User


def _token_from_request(request: Request) -> str | None:
    cookie = request.cookies.get(settings.cookie_name)
    if cookie:
        return cookie
    header = request.headers.get("Authorization")
    if header and header.lower().startswith("bearer "):
        return header[7:]
    return None


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    token = _token_from_request(request)
    if not token:
        return None
    sub = decode_access_token(token)
    if sub is None:
        return None
    user = db.get(User, int(sub))
    if user is None or not user.is_active:
        return None
    return user


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesi berakhir. Silakan masuk kembali.")
    return user


def require_roles(*roles: Role):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Anda tidak punya akses ke bagian ini.")
        return user

    return dependency


require_admin = require_roles(Role.admin)
