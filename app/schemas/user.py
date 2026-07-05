from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserCreate(BaseModel):
    model_config = {"from_attributes": True}
    email: Optional[str] = None
    password: str = Field(min_length=8, max_length=255)
    display_name: Optional[str] = None
    role: Optional[str] = None


class UserUpdate(BaseModel):
    model_config = {"from_attributes": True}
    email: Optional[str] = Field(None, min_length=1, max_length=255)
    password: Optional[str] = Field(None, min_length=8, max_length=255)
    display_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = None


class User(BaseModel):
    id: int
    email: Optional[str] = None
    display_name: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: int
    email: Optional[str] = None
    display_name: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
