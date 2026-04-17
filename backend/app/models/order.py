import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.core.enums import OrderStatus, PaymentStatus, PaymentMethod


class Order(Base):
    """Order model."""

    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=False)
    rider_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    address_id = Column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False)

    # Order amounts
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    promo_code = Column(String(50), nullable=True)
    total_amount = Column(Float, nullable=False)

    # Status
    status = Column(SQLEnum(OrderStatus, name="order_status", create_type=True), default=OrderStatus.PENDING)

    # Payment
    payment_method = Column(SQLEnum(PaymentMethod, name="payment_method", create_type=True), nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus, name="payment_status", create_type=True), default=PaymentStatus.PENDING)
    payment_id = Column(String(255), nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)

    # Delivery
    delivery_instructions = Column(Text, nullable=True)
    estimated_delivery_time = Column(DateTime, nullable=True)
    actual_delivery_time = Column(DateTime, nullable=True)

    # Timestamps
    placed_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    restaurant = relationship("Restaurant", back_populates="orders")
    rider = relationship("User", foreign_keys=[rider_id])
    delivery_address = relationship("Address", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)
    review = relationship("Review", back_populates="order", uselist=False)

    def __repr__(self):
        return f"<Order {self.order_number} ({self.status})>"


class OrderItem(Base):
    """Order item model."""

    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_items.id"), nullable=True)
    item_name = Column(String(255), nullable=False)
    item_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False)
    special_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")

    def __repr__(self):
        return f"<OrderItem {self.item_name} x{self.quantity}>"
