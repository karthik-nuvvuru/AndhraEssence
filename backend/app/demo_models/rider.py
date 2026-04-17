"""Demo rider models using cross-database compatible types."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.db_types import GUID


class Rider(Base):
    """Rider model."""

    __tablename__ = "riders"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    vehicle_type = Column(String(50), nullable=True)  # bike, scooter, cycle
    vehicle_number = Column(String(50), nullable=True)
    license_number = Column(String(50), nullable=True)
    is_available = Column(Boolean, default=False)
    is_online = Column(Boolean, default=False)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    last_location_update = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="rider")
    location_history = relationship("RiderLocationHistory", back_populates="rider", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="rider")

    def __repr__(self):
        return f"<Rider {self.user_id}>"


class RiderLocationHistory(Base):
    """Rider location history for tracking."""

    __tablename__ = "rider_location_history"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    rider_id = Column(GUID(), ForeignKey("riders.id", ondelete="CASCADE"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    rider = relationship("Rider", back_populates="location_history")

    def __repr__(self):
        return f"<RiderLocation {self.latitude}, {self.longitude}>"
