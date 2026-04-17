from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class RiderBase(BaseModel):
    """Base rider schema."""
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    license_number: Optional[str] = None


class RiderCreate(RiderBase):
    """Rider creation schema."""
    user_id: UUID


class RiderUpdate(BaseModel):
    """Rider update schema."""
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    license_number: Optional[str] = None
    is_available: Optional[bool] = None
    is_online: Optional[bool] = None


class RiderResponse(RiderBase):
    """Rider response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    is_available: bool
    is_online: bool
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    last_location_update: Optional[datetime] = None
    created_at: datetime


class RiderLocationUpdate(BaseModel):
    """Rider location update schema."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: Optional[float] = None


class RiderLocationResponse(BaseModel):
    """Rider location response schema."""
    rider_id: UUID
    latitude: float
    longitude: float
    updated_at: datetime


class AvailableOrderResponse(BaseModel):
    """Available order for rider."""
    order_id: UUID
    order_number: str
    pickup_address: str
    pickup_latitude: float
    pickup_longitude: float
    delivery_address: str
    delivery_latitude: float
    delivery_longitude: float
    distance_km: float
    estimated_pickup_time: datetime
    earnings: float
