import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class LongOrderCategory(Base):
    """Long order category (e.g., Pickles, Homemade, Jam)."""

    __tablename__ = "long_order_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship(
        "LongOrderItem", back_populates="category", cascade="all, delete-orphan"
    )


class LongOrderItem(Base):
    """Long order item (e.g., Mango Pickle, Homemade Jam)."""

    __tablename__ = "long_order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("long_order_categories.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    is_bestseller = Column(Boolean, default=False)
    preparation_days = Column(Integer, default=7)  # 1-30 days
    stock_quantity = Column(Integer, default=0)
    unit = Column(String(50), default="piece")  # piece, kg, bottle, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("LongOrderCategory", back_populates="items")
    order_items = relationship("LongOrderOrderItem", back_populates="item")


class LongOrder(Base):
    """Long order (separate from regular Order)."""

    __tablename__ = "long_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    address_id = Column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False)

    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)

    status = Column(String(50), default="pending")  # pending, confirmed, preparing, shipped, delivered, cancelled
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(50), default="pending")

    estimated_delivery_date = Column(DateTime, nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", back_populates="long_orders")
    delivery_address = relationship("Address", back_populates="long_orders")
    items = relationship("LongOrderOrderItem", back_populates="order", cascade="all, delete-orphan")


class LongOrderOrderItem(Base):
    """Item within a long order."""

    __tablename__ = "long_order_items_join"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("long_orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    item_id = Column(
        UUID(as_uuid=True),
        ForeignKey("long_order_items.id"),
        nullable=False,
    )
    item_name = Column(String(255), nullable=False)
    item_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False)

    order = relationship("LongOrder", back_populates="items")
    item = relationship("LongOrderItem", back_populates="order_items")
