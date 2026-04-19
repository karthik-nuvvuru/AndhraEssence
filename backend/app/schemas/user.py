from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.core.enums import UserRole


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    phone: str
    full_name: str
    role: UserRole


class UserCreate(UserBase):
    """User creation schema."""

    password: str


class UserUpdate(BaseModel):
    """User update schema."""

    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class UserResponse(UserBase):
    """User response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserBrief(BaseModel):
    """Brief user info schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    avatar_url: str | None = None


class AddressBase(BaseModel):
    """Base address schema."""

    label: str = "Home"
    address_line: str
    city: str
    state: str
    postal_code: str
    country: str = "India"
    latitude: float | None = None
    longitude: float | None = None
    is_default: bool = False


class AddressCreate(AddressBase):
    """Address creation schema."""

    pass


class AddressUpdate(BaseModel):
    """Address update schema."""

    label: str | None = None
    address_line: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    is_default: bool | None = None


class AddressResponse(AddressBase):
    """Address response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
