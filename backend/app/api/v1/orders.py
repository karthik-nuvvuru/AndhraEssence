from datetime import datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import get_db

settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.order import Order, OrderItem
    from app.demo_models.payment import Promotion
    from app.demo_models.restaurant import MenuItem, Restaurant
    from app.demo_models.user import Address, User
else:
    from app.models.order import Order, OrderItem
    from app.models.payment import Promotion
    from app.models.restaurant import MenuItem, Restaurant
    from app.models.user import Address, User

from app.api.v1.deps import get_current_user
from app.api.v1.notifications import emit_order_status_update
from app.core.enums import OrderStatus, OrderStatusTransitions, PaymentStatus, UserRole
from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.schemas.common import PaginatedResponse
from app.schemas.order import (
    OrderBrief,
    OrderCreate,
    OrderDetailResponse,
    OrderResponse,
    OrderStatusUpdate,
)
from app.workers.tasks import process_refund_requests

router = APIRouter()


def generate_order_number() -> str:
    """Generate unique order number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_suffix = str(uuid4())[:4].upper()
    return f"AE{timestamp}{random_suffix}"


async def apply_promo_code(db: AsyncSession, code: str, order_amount: float) -> float:
    """
    Validate a promo code and return the discount amount.
    Returns 0.0 if the code is invalid or cannot be applied.
    """
    if not code:
        return 0.0

    code = code.upper().strip()

    result = await db.execute(select(Promotion).where(Promotion.code == code))
    promotion = result.scalar_one_or_none()

    if not promotion:
        return 0.0

    # Check if promotion is active
    if not promotion.is_active:
        return 0.0

    # Check validity period
    now = datetime.utcnow()
    if now < promotion.valid_from or now > promotion.valid_until:
        return 0.0

    # Check maximum uses
    if (
        promotion.maximum_uses is not None
        and promotion.current_uses >= promotion.maximum_uses
    ):
        return 0.0

    # Check minimum order amount
    if order_amount < promotion.minimum_order_amount:
        return 0.0

    # Calculate discount
    if promotion.discount_type == "percentage":
        discount = order_amount * (promotion.discount_value / 100)
        if promotion.maximum_discount is not None:
            discount = min(discount, promotion.maximum_discount)
    else:  # fixed
        discount = promotion.discount_value

    return round(min(discount, order_amount), 2)


@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new order."""
    result = await db.execute(
        select(Restaurant).where(Restaurant.id == order_data.restaurant_id)
    )
    restaurant = result.scalar_one_or_none()
    if not restaurant or not restaurant.is_active:
        raise BadRequestException("Restaurant not available")

    # Verify address belongs to user
    result = await db.execute(
        select(Address).where(
            Address.id == order_data.address_id, Address.user_id == current_user.id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise BadRequestException("Invalid delivery address")

    # Calculate order amounts - batch fetch menu items to avoid N+1
    item_ids = [item.menu_item_id for item in order_data.items]
    result = await db.execute(select(MenuItem).where(MenuItem.id.in_(item_ids)))
    menu_items_map = {item.id: item for item in result.scalars().all()}

    subtotal = 0.0
    order_items = []

    for cart_item in order_data.items:
        menu_item = menu_items_map.get(cart_item.menu_item_id)
        if not menu_item or not menu_item.is_available:
            raise BadRequestException(
                f"Item {menu_item.name if menu_item else cart_item.menu_item_id} not available"
            )

        item_subtotal = menu_item.price * cart_item.quantity
        subtotal += item_subtotal

        order_items.append(
            {
                "menu_item_id": cart_item.menu_item_id,
                "item_name": menu_item.name,
                "item_price": menu_item.price,
                "quantity": cart_item.quantity,
                "subtotal": item_subtotal,
                "special_instructions": cart_item.special_instructions,
            }
        )

    # Calculate totals
    tax_amount = round(subtotal * settings.gst_rate, 2)
    delivery_fee = restaurant.delivery_fee
    discount_amount = await apply_promo_code(db, order_data.promo_code, subtotal)
    total_amount = round(subtotal + tax_amount + delivery_fee - discount_amount, 2)

    if subtotal < restaurant.minimum_order:
        raise BadRequestException(f"Minimum order amount is {restaurant.minimum_order}")

    order = Order(
        order_number=generate_order_number(),
        customer_id=current_user.id,
        restaurant_id=restaurant.id,
        address_id=address.id,
        subtotal=subtotal,
        tax_amount=tax_amount,
        delivery_fee=delivery_fee,
        discount_amount=discount_amount,
        total_amount=total_amount,
        payment_method=order_data.payment_method,
        promo_code=order_data.promo_code,
        delivery_instructions=order_data.delivery_instructions,
        status=OrderStatus.PENDING.value,
        payment_status=PaymentStatus.PENDING,
    )
    db.add(order)
    await db.flush()

    for item_data in order_items:
        order_item = OrderItem(order_id=order.id, **item_data)
        db.add(order_item)

    await db.commit()
    await db.refresh(order)

    return order


@router.get("", response_model=PaginatedResponse)
async def list_orders(
    status: OrderStatus | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's orders."""
    query = select(Order).where(Order.customer_id == current_user.id)

    if status:
        query = query.where(Order.status == status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    query = (
        query.offset((page - 1) * limit).limit(limit).order_by(Order.created_at.desc())
    )
    result = await db.execute(query)
    orders = result.scalars().all()

    return PaginatedResponse(
        items=[OrderBrief.model_validate(o) for o in orders],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get order detail."""
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    # Check access
    if (
        order.customer_id != current_user.id
        and order.rider_id != current_user.id
        and current_user.role != UserRole.ADMIN
    ):
        raise ForbiddenException("Access denied")

    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update order status."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    # Validate transition
    if not OrderStatusTransitions.can_transition(order.status, status_update.status):
        raise BadRequestException(
            f"Cannot transition from {order.status} to {status_update.status}"
        )

    # Update status
    order.status = status_update.status

    # Set timestamps
    if status_update.status == OrderStatus.CONFIRMED:
        order.confirmed_at = datetime.utcnow()
    elif status_update.status == OrderStatus.DELIVERED:
        order.completed_at = datetime.utcnow()
        order.actual_delivery_time = datetime.utcnow()
    elif status_update.status == OrderStatus.CANCELLED:
        order.cancelled_at = datetime.utcnow()
        order.cancellation_reason = status_update.reason

    await db.commit()
    await db.refresh(order)

    # Emit WebSocket event to notify subscribers
    await emit_order_status_update(
        str(order.id),
        status_update.status,
        {
            "order_number": order.order_number,
            "updated_at": datetime.utcnow().isoformat(),
        },
    )

    return order


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: UUID,
    reason: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel an order."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    # Only customer or admin can cancel
    if order.customer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Access denied")

    # Can only cancel pending or confirmed orders
    if order.status not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
        raise BadRequestException("Order cannot be cancelled at this stage")

    order.status = OrderStatus.CANCELLED
    order.cancelled_at = datetime.utcnow()
    order.cancellation_reason = reason

    # Check if payment was completed and trigger refund processing
    if order.payment_status == PaymentStatus.COMPLETED:
        order.payment_status = PaymentStatus.REFUNDED
        # Trigger async refund processing via Celery task
        process_refund_requests.delay()

    await db.commit()
    await db.refresh(order)

    # Emit WebSocket event for cancellation
    await emit_order_status_update(
        str(order.id),
        OrderStatus.CANCELLED,
        {
            "order_number": order.order_number,
            "cancellation_reason": reason,
            "updated_at": datetime.utcnow().isoformat(),
        },
    )

    return order
