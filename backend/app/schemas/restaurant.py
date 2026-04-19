from datetime import datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserBrief


class RestaurantBase(BaseModel):
    """Base restaurant schema."""

    name: str
    description: str | None = None
    cuisine_type: str | None = None
    address_line: str
    city: str
    state: str
    postal_code: str
    latitude: float
    longitude: float
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None
    cover_image_url: str | None = None
    delivery_radius_km: float = 5.0
    minimum_order: float = 0.0
    delivery_fee: float = 0.0


class RestaurantCreate(RestaurantBase):
    """Restaurant creation schema."""

    pass


class RestaurantUpdate(BaseModel):
    """Restaurant update schema."""

    name: str | None = None
    description: str | None = None
    cuisine_type: str | None = None
    address_line: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None
    cover_image_url: str | None = None
    is_open: bool | None = None
    opening_time: time | None = None
    closing_time: time | None = None
    delivery_radius_km: float | None = None
    minimum_order: float | None = None
    delivery_fee: float | None = None


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
    cuisine_type: str | None = None
    city: str
    rating: float
    review_count: int
    is_open: bool
    delivery_fee: float
    logo_url: str | None = None
    cover_image_url: str | None = None


class MenuCategoryBase(BaseModel):
    """Base menu category schema."""

    name: str
    description: str | None = None
    sort_order: int = 0


class MenuCategoryCreate(MenuCategoryBase):
    """Menu category creation schema."""

    pass


class MenuCategoryUpdate(BaseModel):
    """Menu category update schema."""

    name: str | None = None
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


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
    description: str | None = None
    price: float
    image_url: str | None = None
    is_veg: bool = True
    is_available: bool = True
    is_featured: bool = False
    preparation_time_minutes: int = 30
    calories: int | None = None
    tags: list[str] | None = None
    sort_order: int = 0


class MenuItemCreate(MenuItemBase):
    """Menu item creation schema."""

    category_id: UUID | None = None


class MenuItemUpdate(BaseModel):
    """Menu item update schema."""

    name: str | None = None
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    category_id: UUID | None = None
    is_veg: bool | None = None
    is_available: bool | None = None
    is_featured: bool | None = None
    preparation_time_minutes: int | None = None
    calories: int | None = None
    tags: list[str] | None = None
    sort_order: int | None = None


class MenuItemResponse(MenuItemBase):
    """Menu item response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    restaurant_id: UUID
    category_id: UUID | None = None
    created_at: datetime
    updated_at: datetime


class RestaurantDetailResponse(RestaurantResponse):
    """Restaurant detail with menu."""

    owner: UserBrief
    categories: list[MenuCategoryResponse] = []
