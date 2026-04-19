"""Demo restaurant models using cross-database compatible types."""

import uuid
from datetime import datetime, time

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
)
from sqlalchemy.orm import relationship

from app.database import Base
from app.db_types import GUID, StringArray


class Restaurant(Base):
    """Restaurant model."""

    __tablename__ = "restaurants"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    owner_id = Column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    cuisine_type = Column(String(100), nullable=True)
    address_line = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    logo_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_open = Column(Boolean, default=True)
    opening_time = Column(Time, default=time(9, 0))
    closing_time = Column(Time, default=time(22, 0))
    delivery_radius_km = Column(Float, default=5.0)
    minimum_order = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="restaurant")
    categories = relationship(
        "MenuCategory", back_populates="restaurant", cascade="all, delete-orphan"
    )
    menu_items = relationship(
        "MenuItem", back_populates="restaurant", cascade="all, delete-orphan"
    )
    orders = relationship("Order", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant")

    def __repr__(self):
        return f"<Restaurant {self.name}>"


class MenuCategory(Base):
    """Menu category model."""

    __tablename__ = "menu_categories"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(
        GUID(), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="categories")
    items = relationship("MenuItem", back_populates="category")

    def __repr__(self):
        return f"<MenuCategory {self.name}>"


class MenuItem(Base):
    """Menu item model."""

    __tablename__ = "menu_items"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(
        GUID(), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    category_id = Column(
        GUID(), ForeignKey("menu_categories.id", ondelete="SET NULL"), nullable=True
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    preparation_time_minutes = Column(Integer, default=30)
    calories = Column(Integer, nullable=True)
    tags = Column(StringArray(String()), nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")
    category = relationship("MenuCategory", back_populates="items")
    order_items = relationship("OrderItem", back_populates="menu_item")

    def __repr__(self):
        return f"<MenuItem {self.name}>"
