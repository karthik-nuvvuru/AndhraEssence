from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.core.enums import OrderStatus, PaymentStatus, PaymentMethod


class OrderItemBase(BaseModel):
    """Base order item schema."""
    menu_item_id: UUID
    quantity: int = Field(..., ge=1)
    special_instructions: Optional[str] = None


class OrderItemCreate(OrderItemBase):
    """Order item creation schema."""
    pass


class OrderItemResponse(BaseModel):
    """Order item response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    menu_item_id: Optional[UUID] = None
    item_name: str
    item_price: float
    quantity: int
    subtotal: float
    special_instructions: Optional[str] = None


class CartItem(BaseModel):
    """Cart item schema for creating orders."""
    menu_item_id: UUID
    quantity: int = Field(..., ge=1)
    special_instructions: Optional[str] = None


class OrderCreate(BaseModel):
    """Order creation schema."""
    restaurant_id: UUID
    address_id: UUID
    items: List[CartItem]
    payment_method: PaymentMethod
    promo_code: Optional[str] = None
    delivery_instructions: Optional[str] = None


class OrderUpdate(BaseModel):
    """Order update schema."""
    status: Optional[OrderStatus] = None
    rider_id: Optional[UUID] = None
    estimated_delivery_time: Optional[datetime] = None


class OrderResponse(BaseModel):
    """Order response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    customer_id: UUID
    restaurant_id: UUID
    rider_id: Optional[UUID] = None
    address_id: UUID
    subtotal: float
    tax_amount: float
    delivery_fee: float
    discount_amount: float
    promo_code: Optional[str] = None
    total_amount: float
    status: OrderStatus
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    delivery_instructions: Optional[str] = None
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    placed_at: datetime
    confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime


class OrderDetailResponse(OrderResponse):
    """Order detail with items."""
    items: List[OrderItemResponse] = []


class OrderStatusUpdate(BaseModel):
    """Order status update schema."""
    status: OrderStatus
    reason: Optional[str] = None


class OrderBrief(BaseModel):
    """Brief order info for lists."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    restaurant_name: Optional[str] = None
    total_amount: float
    status: OrderStatus
    placed_at: datetime
