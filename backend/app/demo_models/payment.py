"""Demo payment models using cross-database compatible types."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.enums import PaymentStatus
from app.database import Base
from app.db_types import GUID


class Payment(Base):
    """Payment model."""

    __tablename__ = "payments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id = Column(
        GUID(), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True
    )
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(
        SQLEnum(PaymentStatus, name="payment_status", create_type=True),
        default=PaymentStatus.PENDING,
    )
    payment_method = Column(String(50), nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    failure_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="payment")

    def __repr__(self):
        return f"<Payment {self.id} ({self.status})>"


class Promotion(Base):
    """Promotion/Coupon model."""

    __tablename__ = "promotions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(500), nullable=True)
    discount_type = Column(String(20), nullable=False)  # percentage, fixed
    discount_value = Column(Float, nullable=False)
    maximum_discount = Column(Float, nullable=True)
    minimum_order_amount = Column(Float, default=0.0)
    maximum_uses = Column(Integer, nullable=True)
    current_uses = Column(Integer, default=0)
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Promotion {self.code}>"
