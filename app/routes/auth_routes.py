from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.auth import (
    get_password_hash, verify_password, create_access_token, get_current_user,
)

auth_router = APIRouter()


class SignupRequest(BaseModel):
    model_config = {"from_attributes": True}
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)
    display_name: str = ""


class LoginRequest(BaseModel):
    model_config = {"from_attributes": True}
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


def _get_user_model():
    import importlib
    for mod, cls in (("app.models.user", "User"), ("app.models.users", "User")):
        try:
            m = importlib.import_module(mod)
            return getattr(m, cls)
        except (ImportError, AttributeError):
            continue
    raise ImportError("No User model found in app.models.user or app.models.users")


def _make_user(email: str, password: str, display_name: str = ""):
    """Build a User instance regardless of which password field the model uses."""
    User = _get_user_model()
    cols = {c.name for c in User.__table__.columns}
    kw: dict = {"username": email.split("@")[0]}
    pwd_hash = get_password_hash(password)
    for field in ("hashed_password", "password_hash", "password"):
        if field in cols:
            kw[field] = pwd_hash
            break
    if "display_name" in cols:
        kw["display_name"] = display_name or email.split("@")[0]
    if "email" in cols:
        kw["email"] = email
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
    return User(**{k: v for k, v in kw.items() if k in User.__table__.columns.keys()})


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
    # The User model has 'username' as a unique field, not 'email'.
    # We'll use the email as the username for signup.
    if db.query(User).filter(User.username == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = _make_user(req.email, req.password, req.display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": req.email, # Return the email from the request for consistency
        "display_name": getattr(user, "display_name", user.username),
    }


@auth_router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    User = _get_user_model()
    # The User model has 'username' as a unique field, not 'email'.
    # We'll use the email from the request to query the username.
    user = db.query(User).filter(User.username == req.email).first()
    stored = _read_password(user) if user else None
    if not user or not stored or not verify_password(req.password, stored):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(data={"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": req.email, # Return the email from the request for consistency
        "display_name": getattr(user, "display_name", user.username),
    }


@auth_router.get("/auth/me")
def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": getattr(current_user, "email", current_user.username), # Use username if email not present
        "display_name": getattr(current_user, "display_name", None),
        "role": getattr(current_user, "role", None),
    }


@auth_router.post("/auth/logout")
def logout(current_user=Depends(get_current_user)):
    # JWTs are stateless - logout is handled client-side by discarding the token.
    # This endpoint confirms the user is authenticated and acknowledges the request.
    return {"message": "Successfully logged out"}
