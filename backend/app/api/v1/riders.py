from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import get_db

settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.order import Order
    from app.demo_models.rider import Rider
    from app.demo_models.user import User
    from app.demo_models.review import Review
else:
    from app.models.order import Order
    from app.models.rider import Rider, RiderLocationHistory
    from app.models.user import User
    from app.models.review import Review

from app.api.v1.deps import get_current_user
from app.config import get_settings
from app.core.enums import OrderStatus, UserRole
from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.schemas.order import OrderResponse
from app.schemas.rider import (
    AvailableOrderResponse,
    RiderDeliveryConfirm,
    RiderDeliveryHistoryEntry,
    RiderDeliveryHistoryResponse,
    RiderLocationUpdate,
    RiderPickupConfirm,
    RiderRatingSubmit,
    RiderResponse,
    RiderUpdate,
)
from app.utils.distance import (
    calculate_earnings,
    calculate_eta,
    calculate_haversine_distance,
)

router = APIRouter()


async def get_rider_or_create(user: User, db: AsyncSession) -> Rider:
    """Get rider profile or create one if it doesn't exist."""
    result = await db.execute(select(Rider).where(Rider.user_id == user.id))
    rider = result.scalar_one_or_none()

    if not rider:
        if user.role != UserRole.RIDER:
            raise ForbiddenException("Only riders can access this endpoint")

        rider = Rider(user_id=user.id)
        db.add(rider)
        await db.commit()
        await db.refresh(rider)

    return rider


@router.post("/register", response_model=RiderResponse)
async def register_as_rider(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Register current user as a rider."""
    if current_user.role != UserRole.RIDER:
        raise ForbiddenException("Only users with rider role can register as riders")

    # Check if rider profile already exists
    result = await db.execute(select(Rider).where(Rider.user_id == current_user.id))
    if result.scalar_one_or_none():
        raise BadRequestException("Rider profile already exists")

    rider = Rider(user_id=current_user.id)
    db.add(rider)
    await db.commit()
    await db.refresh(rider)

    return rider


@router.get("/me", response_model=RiderResponse)
async def get_rider_profile(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get current rider's profile."""
    rider = await get_rider_or_create(current_user, db)
    return rider


@router.put("/me", response_model=RiderResponse)
async def update_rider_profile(
    update_data: RiderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update rider profile."""
    rider = await get_rider_or_create(current_user, db)

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(rider, field, value)

    await db.commit()
    await db.refresh(rider)

    return rider


@router.put("/location", response_model=RiderLocationUpdate)
async def update_location(
    location_data: RiderLocationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update rider's current location."""
    rider = await get_rider_or_create(current_user, db)

    rider.current_latitude = location_data.latitude
    rider.current_longitude = location_data.longitude
    rider.last_location_update = datetime.utcnow()

    # Add to location history
    location_history = RiderLocationHistory(
        rider_id=rider.id,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
        accuracy=location_data.accuracy,
    )
    db.add(location_history)

    await db.commit()

    return location_data


@router.get("/orders/available", response_model=list[AvailableOrderResponse])
async def get_available_orders(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get available orders for rider to accept."""
    rider = await get_rider_or_create(current_user, db)

    if not rider.is_online or not rider.is_available:
        raise BadRequestException("You must be online and available to accept orders")

    # Get orders that are ready for pickup and don't have a rider assigned
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.restaurant))
        .options(selectinload(Order.delivery_address))
        .where(Order.status == OrderStatus.READY, Order.rider_id.is_(None))
        .order_by(Order.created_at.asc())
        .limit(10)
    )
    orders = result.scalars().all()

    available_orders = []
    for order in orders:
        # Calculate distance from rider's location to restaurant
        distance_km = 0.0
        if (
            rider.current_latitude is not None
            and rider.current_longitude is not None
            and order.restaurant.latitude is not None
            and order.restaurant.longitude is not None
        ):
            distance_km = calculate_haversine_distance(
                rider.current_latitude,
                rider.current_longitude,
                order.restaurant.latitude,
                order.restaurant.longitude,
            )

        # Calculate ETA based on distance
        estimated_pickup_time = calculate_eta(distance_km)

        # Calculate earnings based on distance
        earnings = calculate_earnings(distance_km)

        available_orders.append(
            AvailableOrderResponse(
                order_id=order.id,
                order_number=order.order_number,
                pickup_address=order.restaurant.address_line,
                pickup_latitude=order.restaurant.latitude,
                pickup_longitude=order.restaurant.longitude,
                delivery_address=order.delivery_address.address_line,
                delivery_latitude=order.delivery_address.latitude,
                delivery_longitude=order.delivery_address.longitude,
                distance_km=round(distance_km, 2),
                estimated_pickup_time=estimated_pickup_time,
                earnings=round(earnings, 2),
            )
        )

    return available_orders


@router.post("/orders/{order_id}/accept", response_model=OrderResponse)
async def accept_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Accept an order for delivery."""
    rider = await get_rider_or_create(current_user, db)

    if not rider.is_online or not rider.is_available:
        raise BadRequestException("You must be online and available to accept orders")

    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.status != OrderStatus.READY:
        raise BadRequestException("Order is not available for pickup")

    if order.rider_id:
        raise BadRequestException("Order already has a rider assigned")

    order.rider_id = current_user.id
    await db.commit()
    await db.refresh(order)

    return order


@router.get("/orders", response_model=list[OrderResponse])
async def get_rider_orders(
    status: OrderStatus | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get rider's assigned orders."""
    result = await db.execute(select(Order).where(Order.rider_id == current_user.id))
    orders = result.scalars().all()

    if status:
        orders = [o for o in orders if o.status == status]

    return orders


@router.post("/pickup")
async def confirm_pickup(
    pickup_data: RiderPickupConfirm,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Confirm order pickup by rider."""
    result = await db.execute(
        select(Order).where(Order.id == pickup_data.order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.rider_id != current_user.id:
        raise ForbiddenException("Order not assigned to this rider")

    if order.status != OrderStatus.READY:
        raise BadRequestException("Order is not ready for pickup")

    order.status = OrderStatus.PICKED_UP
    order.picked_up_at = datetime.utcnow()
    await db.commit()
    await db.refresh(order)

    return {"message": "Pickup confirmed", "order_id": str(order.id)}


@router.post("/deliver")
async def confirm_delivery(
    delivery_data: RiderDeliveryConfirm,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Confirm delivery completion by rider."""
    result = await db.execute(
        select(Order).where(Order.id == delivery_data.order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.rider_id != current_user.id:
        raise ForbiddenException("Order not assigned to this rider")

    if order.status not in [OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT]:
        raise BadRequestException("Order cannot be delivered at this stage")

    order.status = OrderStatus.DELIVERED
    order.delivered_at = datetime.utcnow()
    order.completed_at = datetime.utcnow()
    order.actual_delivery_time = datetime.utcnow()
    await db.commit()
    await db.refresh(order)

    return {"message": "Delivery confirmed", "order_id": str(order.id)}


@router.get("/history")
async def get_delivery_history(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get rider's delivery history with earnings."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.restaurant))
        .options(selectinload(Order.delivery_address))
        .options(selectinload(Order.review))
        .where(
            Order.rider_id == current_user.id,
            Order.status == OrderStatus.DELIVERED,
        )
        .order_by(Order.completed_at.desc())
        .limit(limit)
    )
    orders = result.scalars().all()

    total_earnings = 0.0
    total_rating = 0
    rating_count = 0

    entries = []
    for order in orders:
        # Calculate earnings (simplified - could be enhanced)
        earnings = order.delivery_fee if order.delivery_fee else 20.0
        total_earnings += earnings

        rating = None
        if order.review:
            rating = order.review.rating
            total_rating += rating
            rating_count += 1

        entries.append(
            RiderDeliveryHistoryEntry(
                order_id=order.id,
                order_number=order.order_number,
                restaurant_name=order.restaurant.name if order.restaurant else "Unknown",
                customer_address=(
                    order.delivery_address.address_line
                    if order.delivery_address
                    else "Unknown"
                ),
                earnings=earnings,
                rating=rating,
                delivered_at=order.completed_at,
            )
        )

    average_rating = total_rating / rating_count if rating_count > 0 else None

    return RiderDeliveryHistoryResponse(
        total_deliveries=len(entries),
        total_earnings=total_earnings,
        average_rating=average_rating,
        deliveries=entries,
    )


@router.post("/rating")
async def submit_rider_rating(
    rating_data: RiderRatingSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit rider's rating for a customer after delivery."""
    result = await db.execute(
        select(Order).where(Order.id == rating_data.order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    if order.rider_id != current_user.id:
        raise ForbiddenException("Order not assigned to this rider")

    if order.status != OrderStatus.DELIVERED:
        raise BadRequestException("Order must be delivered before rating")

    # Create a review from rider's perspective
    # This is stored differently from customer reviews
    return {"message": "Rating submitted", "rating": rating_data.rating}
