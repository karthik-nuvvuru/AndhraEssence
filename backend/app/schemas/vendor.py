from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class VendorOrderResponse(BaseModel):
    id: str
    order_number: str
    customer_name: str
    status: str
    total_amount: float
    items_count: int
    placed_at: datetime
    delivery_address: str

    class Config:
        from_attributes = True


class VendorDashboardStats(BaseModel):
    orders_today: int
    orders_pending: int
    revenue_today: float
    revenue_week: float
    rating: float
    review_count: int

    class Config:
        from_attributes = True


class EarningsEntry(BaseModel):
    date: date
    orders_count: int
    revenue: float

    class Config:
        from_attributes = True


class EarningsResponse(BaseModel):
    total_earnings: float
    period_start: date
    period_end: date
    entries: list[EarningsEntry]

    class Config:
        from_attributes = True
