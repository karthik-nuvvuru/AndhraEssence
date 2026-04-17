from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, time
from uuid import UUID
from app.schemas.user import UserBrief


class RestaurantBase(BaseModel):
    """Base restaurant schema."""
    name: str
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    address_line: str
    city: str
    state: str
    postal_code: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    delivery_radius_km: float = 5.0
    minimum_order: float = 0.0
    delivery_fee: float = 0.0


class RestaurantCreate(RestaurantBase):
    """Restaurant creation schema."""
    pass


class RestaurantUpdate(BaseModel):
    """Restaurant update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_open: Optional[bool] = None
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    delivery_radius_km: Optional[float] = None
    minimum_order: Optional[float] = None
    delivery_fee: Optional[float] = None


class RestaurantResponse(RestaurantBase):
    """Restaurant response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_id: UUID
    slug: str
    rating: float
    review_count: int
    is_active: bool
    is_open: bool
    opening_time: time
    closing_time: time
    created_at: datetime


class RestaurantBrief(BaseModel):
    """Brief restaurant info for lists."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    cuisine_type: Optional[str] = None
    city: str
    rating: float
    review_count: int
    is_open: bool
    delivery_fee: float
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None


class MenuCategoryBase(BaseModel):
    """Base menu category schema."""
    name: str
    description: Optional[str] = None
    sort_order: int = 0


class MenuCategoryCreate(MenuCategoryBase):
    """Menu category creation schema."""
    pass


class MenuCategoryUpdate(BaseModel):
    """Menu category update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class MenuCategoryResponse(MenuCategoryBase):
    """Menu category response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    restaurant_id: UUID
    is_active: bool
    created_at: datetime


class MenuItemBase(BaseModel):
    """Base menu item schema."""
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_veg: bool = True
    is_available: bool = True
    is_featured: bool = False
    preparation_time_minutes: int = 30
    calories: Optional[int] = None
    tags: Optional[List[str]] = None
    sort_order: int = 0


class MenuItemCreate(MenuItemBase):
    """Menu item creation schema."""
    category_id: Optional[UUID] = None


class MenuItemUpdate(BaseModel):
    """Menu item update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category_id: Optional[UUID] = None
    is_veg: Optional[bool] = None
    is_available: Optional[bool] = None
    is_featured: Optional[bool] = None
    preparation_time_minutes: Optional[int] = None
    calories: Optional[int] = None
    tags: Optional[List[str]] = None
    sort_order: Optional[int] = None


class MenuItemResponse(MenuItemBase):
    """Menu item response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    restaurant_id: UUID
    category_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class RestaurantDetailResponse(RestaurantResponse):
    """Restaurant detail with menu."""
    owner: UserBrief
    categories: List[MenuCategoryResponse] = []
