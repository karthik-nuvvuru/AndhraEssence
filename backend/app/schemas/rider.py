from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RiderBase(BaseModel):
    """Base rider schema."""

    vehicle_type: str | None = None
    vehicle_number: str | None = None
    license_number: str | None = None


class RiderCreate(RiderBase):
    """Rider creation schema."""

    user_id: UUID


class RiderUpdate(BaseModel):
    """Rider update schema."""

    vehicle_type: str | None = None
    vehicle_number: str | None = None
    license_number: str | None = None
    is_available: bool | None = None
    is_online: bool | None = None


class RiderResponse(RiderBase):
    """Rider response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    is_available: bool
    is_online: bool
    current_latitude: float | None = None
    current_longitude: float | None = None
    last_location_update: datetime | None = None
    created_at: datetime


class RiderLocationUpdate(BaseModel):
    """Rider location update schema."""

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: float | None = None


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


class RiderPickupConfirm(BaseModel):
    """Rider confirms pickup."""

    order_id: UUID


class RiderDeliveryConfirm(BaseModel):
    """Rider confirms delivery."""

    order_id: UUID
    signature_image: str | None = None


class RiderRatingSubmit(BaseModel):
    """Rider submits rating for customer."""

    order_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class RiderDeliveryHistoryEntry(BaseModel):
    """Delivery history entry."""

    order_id: UUID
    order_number: str
    restaurant_name: str
    customer_address: str
    earnings: float
    rating: int | None
    delivered_at: datetime


class RiderDeliveryHistoryResponse(BaseModel):
    """Rider delivery history."""

    total_deliveries: int
    total_earnings: float
    average_rating: float | None
    deliveries: list[RiderDeliveryHistoryEntry]
