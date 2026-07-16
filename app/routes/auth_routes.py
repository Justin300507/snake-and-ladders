from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.auth import (
    get_password_hash, verify_password, create_access_token, get_current_user,
    _get_user_model, _login_field,
)

auth_router = APIRouter()


class SignupRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)
    display_name: str = ""



class LoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


def _identifier_value(login_field: str, email: str) -> str:
    return email if login_field == "email" else email.split("@")[0]


def _make_user(email: str, password: str, display_name: str = ""):
    """Build a User instance regardless of which password/identifier field the model uses."""
    User = _get_user_model()
    cols = {c.name for c in User.__table__.columns}
    login_field = _login_field(User)
    identifier = _identifier_value(login_field, email)
    kw: dict = {login_field: identifier}
    if login_field != "email" and "email" in cols:
        kw["email"] = email
    pwd_hash = get_password_hash(password)
    for field in ("hashed_password", "password_hash", "password"):
        if field in cols:
            kw[field] = pwd_hash
            break
    if "display_name" in cols:
        kw["display_name"] = display_name or email.split("@")[0]
    if "username" in cols and "username" not in kw:
        kw["username"] = email.split("@")[0]
    if "is_active" in cols:
        kw["is_active"] = True
    if "role" in cols:
        kw["role"] = "user"
    # Fill any remaining NOT NULL columns that have no default so injected auth
    # routes work even when the LLM adds custom non-nullable columns (e.g. status).
    _COL_STR_DEFAULTS = {
        "status": "active", "state": "active", "type": "user",
        "gender": "other", "plan": "free", "tier": "basic",
        "account_type": "standard", "subscription": "free",
    }
    for col in User.__table__.columns:
        if col.name in kw or col.primary_key:
            continue
        if col.nullable or col.default is not None or col.server_default is not None:
            continue
        col_type = type(col.type).__name__.lower()
        if col.name in _COL_STR_DEFAULTS:
            kw[col.name] = _COL_STR_DEFAULTS[col.name]
        elif any(t in col_type for t in ("str", "text", "char", "varchar")):
            kw[col.name] = "active"
        elif any(t in col_type for t in ("int", "float", "numeric", "decimal")):
            kw[col.name] = 0
        elif "bool" in col_type:
            kw[col.name] = True
        else:
            kw[col.name] = ""
    return User(**{k: v for k, v in kw.items() if k in cols})


def _read_password(user) -> str | None:
    for field in ("hashed_password", "password_hash", "password"):
        val = getattr(user, field, None)
        if val:
            return val
    return None


@auth_router.post("/auth/signup")
@auth_router.post("/auth/register")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    User = _get_user_model()
    login_field = _login_field(User)
    identifier = _identifier_value(login_field, req.email)
    if db.query(User).filter(getattr(User, login_field) == identifier).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = _make_user(req.email, req.password, req.display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": identifier})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": req.email,
        "display_name": getattr(user, "display_name", req.email.split("@")[0]),
    }


@auth_router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    User = _get_user_model()
    login_field = _login_field(User)
    identifier = _identifier_value(login_field, req.email)
    user = db.query(User).filter(getattr(User, login_field) == identifier).first()
    stored = _read_password(user) if user else None
    if not user or not stored or not verify_password(req.password, stored):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(data={"sub": identifier})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": getattr(user, "email", req.email),
        "display_name": getattr(user, "display_name", identifier),
    }


@auth_router.get("/auth/me")
def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": getattr(current_user, "email", getattr(current_user, "username", None)),
        "display_name": getattr(current_user, "display_name", None),
        "role": getattr(current_user, "role", None),
    }


@auth_router.post("/auth/logout")
def logout(current_user=Depends(get_current_user)):
    # JWTs are stateless — logout is handled client-side by discarding the token.
    # This endpoint confirms the user is authenticated and acknowledges the request.
    return {"message": "Successfully logged out"}
