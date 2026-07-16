import os
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# rounds=4 keeps bcrypt fast (<10ms) so route handlers don't block uvicorn threads
_BCRYPT_ROUNDS = 4


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(_BCRYPT_ROUNDS)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _get_user_model():
    import importlib
    for mod in ("app.models.user", "app.models.users"):
        try:
            m = importlib.import_module(mod)
            return getattr(m, "User")
        except (ImportError, AttributeError):
            continue
    raise ImportError("No User model found in app.models.user or app.models.users")


def _login_field(User) -> str:
    """Which column uniquely identifies a user for login -- 'email' if the
    model has one, else 'username'. Signup, login, and get_current_user must
    all agree on this: a user created under one identifier field can never
    be found again by a path that assumes the other, and since the field
    doesn't exist at all on some models, comparing against it outright
    raises AttributeError -- 500ing the request instead of a clean 401.
    """
    cols = {c.name for c in User.__table__.columns}
    return "email" if "email" in cols else "username"


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    User = _get_user_model()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get("sub")
        if not identifier:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    user = db.query(User).filter(getattr(User, _login_field(User)) == identifier).first()
    if not user:
        raise credentials_exception
    return user


def authenticate_user(db: Session, identifier: str, password: str):
    """Convenience helper — LLM-generated routes commonly import this."""
    User = _get_user_model()
    user = db.query(User).filter(getattr(User, _login_field(User)) == identifier).first()
    if not user:
        return None
    for field in ("hashed_password", "password_hash", "password"):
        stored = getattr(user, field, None)
        if stored and verify_password(password, stored):
            return user
    return None
