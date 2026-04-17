from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
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
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """User response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserBrief(BaseModel):
    """Brief user info schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    avatar_url: Optional[str] = None


class AddressBase(BaseModel):
    """Base address schema."""
    label: str = "Home"
    address_line: str
    city: str
    state: str
    postal_code: str
    country: str = "India"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False


class AddressCreate(AddressBase):
    """Address creation schema."""
    pass


class AddressUpdate(BaseModel):
    """Address update schema."""
    label: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    """Address response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
