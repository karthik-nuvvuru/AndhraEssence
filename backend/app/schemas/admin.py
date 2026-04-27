from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PromotionCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float = 0
    max_uses: int = 100
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True


class PromotionUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_uses: Optional[int] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    target_roles: list[str]
    is_active: bool = True


class RoleUpdate(BaseModel):
    role: str


class AdminSettingsUpdate(BaseModel):
    platform_name: Optional[str] = None
    support_email: Optional[str] = None
    support_phone: Optional[str] = None
    commission_rate: Optional[float] = None
    min_order_amount: Optional[float] = None
    delivery_radius_km: Optional[float] = None
