from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import OrderStatus, PaymentMethod, PaymentStatus


class OrderItemBase(BaseModel):
    """Base order item schema."""

    menu_item_id: UUID
    quantity: int = Field(..., ge=1)
    special_instructions: str | None = None


class OrderItemCreate(OrderItemBase):
    """Order item creation schema."""

    pass


class OrderItemResponse(BaseModel):
    """Order item response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    menu_item_id: UUID | None = None
    item_name: str
    item_price: float
    quantity: int
    subtotal: float
    special_instructions: str | None = None


class CartItem(BaseModel):
    """Cart item schema for creating orders."""

    menu_item_id: UUID
    quantity: int = Field(..., ge=1)
    special_instructions: str | None = None


class OrderCreate(BaseModel):
    """Order creation schema."""

    restaurant_id: UUID
    address_id: UUID
    items: list[CartItem]
    payment_method: PaymentMethod
    promo_code: str | None = None
    delivery_instructions: str | None = None


class OrderUpdate(BaseModel):
    """Order update schema."""

    status: OrderStatus | None = None
    rider_id: UUID | None = None
    estimated_delivery_time: datetime | None = None


class OrderResponse(BaseModel):
    """Order response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    customer_id: UUID
    restaurant_id: UUID
    rider_id: UUID | None = None
    address_id: UUID
    subtotal: float
    tax_amount: float
    delivery_fee: float
    discount_amount: float
    promo_code: str | None = None
    total_amount: float
    status: OrderStatus
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    delivery_instructions: str | None = None
    estimated_delivery_time: datetime | None = None
    actual_delivery_time: datetime | None = None
    placed_at: datetime
    confirmed_at: datetime | None = None
    completed_at: datetime | None = None
    cancelled_at: datetime | None = None
    cancellation_reason: str | None = None
    created_at: datetime


class OrderDetailResponse(OrderResponse):
    """Order detail with items."""

    items: list[OrderItemResponse] = []


class OrderStatusUpdate(BaseModel):
    """Order status update schema."""

    status: OrderStatus
    reason: str | None = None


class OrderBrief(BaseModel):
    """Brief order info for lists."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    restaurant_name: str | None = None
    total_amount: float
    status: OrderStatus
    placed_at: datetime
