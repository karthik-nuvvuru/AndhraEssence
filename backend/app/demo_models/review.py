"""Demo review models using cross-database compatible types."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.db_types import GUID, JSONType


class Review(Base):
    """Review model for orders."""

    __tablename__ = "reviews"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID(), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(GUID(), ForeignKey("restaurants.id"), nullable=False)
    rider_id = Column(GUID(), ForeignKey("riders.id"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text, nullable=True)
    food_rating = Column(Integer, nullable=True)  # 1-5
    delivery_rating = Column(Integer, nullable=True)  # 1-5
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="review")
    customer = relationship("User")
    restaurant = relationship("Restaurant", back_populates="reviews")
    rider = relationship("Rider", back_populates="reviews")

    def __repr__(self):
        return f"<Review {self.id} ({self.rating} stars)>"


class Notification(Base):
    """Notification model."""

    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=True)  # order_update, promo, system
    data = Column(JSONType(), nullable=True)  # Additional data as JSON
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.title}>"
