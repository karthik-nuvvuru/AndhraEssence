from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LongOrderCategoryResponse(BaseModel):
    """Response schema for long order category."""

    id: UUID
    name: str
    description: str | None
    image_url: str | None
    sort_order: int
    is_active: bool
    items_count: int = 0

    class Config:
        from_attributes = True


class LongOrderItemResponse(BaseModel):
    """Response schema for long order item."""

    id: UUID
    category_id: UUID
    name: str
    description: str | None
    price: float
    image_url: str | None
    is_veg: bool
    is_available: bool
    is_bestseller: bool
    preparation_days: int
    stock_quantity: int
    unit: str

    class Config:
        from_attributes = True


class LongOrderItemBrief(BaseModel):
    """Brief item for cart."""

    id: UUID
    name: str
    price: float
    image_url: str | None
    preparation_days: int
    unit: str


class LongOrderCartItemRequest(BaseModel):
    """Item in cart validation request."""

    item_id: UUID
    quantity: int = Field(ge=1)


class LongOrderCartValidationRequest(BaseModel):
    """Request to validate long order cart."""

    items: list[LongOrderCartItemRequest]
    address_id: UUID


class LongOrderCartEstimateResponse(BaseModel):
    """Delivery estimate response."""

    max_preparation_days: int
    estimated_delivery_date: datetime
    total_amount: float
    subtotal: float
    delivery_fee: float


class LongOrderCartValidationResponse(BaseModel):
    """Cart validation response."""

    is_valid: bool
    errors: list[str] = []
    max_preparation_days: int
    estimated_delivery_date: datetime
    subtotal: float
    delivery_fee: float
    total_amount: float


class LongOrderCreateRequest(BaseModel):
    """Request to create a long order."""

    address_id: UUID
    items: list[LongOrderCartItemRequest]
    payment_method: str = "razorpay"
    promo_code: str | None = None


class LongOrderItemResponseDetail(BaseModel):
    """Order item detail."""

    id: UUID
    item_id: UUID
    item_name: str
    item_price: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True


class LongOrderResponse(BaseModel):
    """Response schema for long order."""

    id: UUID
    order_number: str
    status: str
    subtotal: float
    delivery_fee: float
    total_amount: float
    payment_method: str
    payment_status: str
    estimated_delivery_date: datetime | None
    shipped_at: datetime | None
    delivered_at: datetime | None
    cancelled_at: datetime | None
    created_at: datetime
    items: list[LongOrderItemResponseDetail]

    class Config:
        from_attributes = True


class LongOrderBrief(BaseModel):
    """Brief order for list view."""

    id: UUID
    order_number: str
    status: str
    total_amount: float
    items_count: int
    estimated_delivery_date: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
