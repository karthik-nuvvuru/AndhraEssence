from enum import Enum


class UserRole(str, Enum):
    """User roles in the system."""

    CUSTOMER = "customer"
    RESTAURANT_OWNER = "restaurant_owner"
    RIDER = "rider"
    ADMIN = "admin"


class OrderStatus(str, Enum):
    """Order status states."""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, Enum):
    """Payment status states."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    """Payment methods."""

    RAZORPAY = "razorpay"
    WALLET = "wallet"
    COD = "cod"


class OrderStatusTransitions:
    """Valid order status transitions."""

    VALID_TRANSITIONS = {
        OrderStatus.PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        OrderStatus.CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
        OrderStatus.PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
        OrderStatus.READY: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
        OrderStatus.PICKED_UP: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED],
        OrderStatus.IN_TRANSIT: [OrderStatus.DELIVERED],
        OrderStatus.DELIVERED: [],
        OrderStatus.CANCELLED: [OrderStatus.REFUNDED],
        OrderStatus.REFUNDED: [],
    }

    @classmethod
    def can_transition(cls, from_status: OrderStatus, to_status: OrderStatus) -> bool:
        """Check if a status transition is valid."""
        return to_status in cls.VALID_TRANSITIONS.get(from_status, [])

    @classmethod
    def get_next_statuses(cls, current_status: OrderStatus) -> list[OrderStatus]:
        """Get valid next statuses."""
        return cls.VALID_TRANSITIONS.get(current_status, [])
