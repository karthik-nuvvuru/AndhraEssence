"""Demo models using cross-database compatible types for SQLite fallback.

This module provides SQLite-compatible versions of all models
for use when demo_mode=True in settings.
"""

from app.demo_models.order import Order, OrderItem
from app.demo_models.payment import Payment, Promotion
from app.demo_models.restaurant import MenuCategory, MenuItem, Restaurant
from app.demo_models.review import Notification, Review
from app.demo_models.rider import Rider, RiderLocationHistory
from app.demo_models.user import Address, User

__all__ = [
    "User",
    "Address",
    "Restaurant",
    "MenuCategory",
    "MenuItem",
    "Order",
    "OrderItem",
    "Rider",
    "RiderLocationHistory",
    "Payment",
    "Promotion",
    "Review",
    "Notification",
]
