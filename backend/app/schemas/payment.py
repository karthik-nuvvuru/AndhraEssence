from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.core.enums import PaymentStatus


class PaymentCreate(BaseModel):
    """Payment creation schema."""

    order_id: UUID
    amount: float
    currency: str = "INR"


class PaymentResponse(BaseModel):
    """Payment response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_id: UUID | None = None
    user_id: UUID
    amount: float
    currency: str
    status: PaymentStatus
    payment_method: str | None = None
    razorpay_order_id: str | None = None
    razorpay_payment_id: str | None = None
    failure_reason: str | None = None
    created_at: datetime


class RazorpayOrderCreate(BaseModel):
    """Razorpay order creation schema."""

    order_id: UUID
    amount: float
    currency: str = "INR"


class RazorpayOrderResponse(BaseModel):
    """Razorpay order response schema."""

    id: str
    entity: str
    amount: int
    currency: str
    status: str
    receipt: str | None = None


class RazorpayVerify(BaseModel):
    """Razorpay payment verification schema."""

    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PromotionBase(BaseModel):
    """Base promotion schema."""

    code: str
    description: str | None = None
    discount_type: str  # percentage, fixed
    discount_value: float
    maximum_discount: float | None = None
    minimum_order_amount: float = 0.0
    maximum_uses: int | None = None
    valid_from: datetime
    valid_until: datetime


class PromotionCreate(PromotionBase):
    """Promotion creation schema."""

    pass


class PromotionResponse(PromotionBase):
    """Promotion response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    current_uses: int
    is_active: bool
    created_at: datetime


class ApplyPromoCode(BaseModel):
    """Apply promo code schema."""

    code: str
    order_amount: float
