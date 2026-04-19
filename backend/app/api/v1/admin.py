import asyncio
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import get_db

settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.order import Order
    from app.demo_models.restaurant import Restaurant
    from app.demo_models.rider import Rider
    from app.demo_models.user import User
else:
    from app.models.order import Order
    from app.models.restaurant import Restaurant
    from app.models.rider import Rider
    from app.models.user import User

from app.core.enums import PaymentStatus, UserRole
from app.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)
from app.core.security import decode_token, oauth2_scheme
from app.schemas.restaurant import RestaurantResponse
from app.schemas.rider import RiderResponse
from app.schemas.user import UserResponse

router = APIRouter()


async def get_admin_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedException("Not authenticated")
    payload = decode_token(token)
    if payload.get("role") != UserRole.ADMIN.value:
        raise ForbiddenException("Admin access required")
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    return user


@router.get("/dashboard")
async def get_dashboard_stats(
    current_admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics."""
    today = datetime.utcnow().date()

    # Run independent queries in parallel
    (
        total_users_result,
        total_restaurants_result,
        active_riders_result,
        orders_today_result,
        revenue_today_result,
    ) = await asyncio.gather(
        db.execute(select(func.count()).select_from(User)),
        db.execute(select(func.count()).select_from(Restaurant)),
        db.execute(select(func.count()).select_from(Rider).where(Rider.is_online)),
        db.execute(
            select(func.count())
            .select_from(Order)
            .where(func.date(Order.created_at) == today)
        ),
        db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .select_from(Order)
            .where(
                func.date(Order.created_at) == today,
                Order.payment_status == PaymentStatus.COMPLETED,
            )
        ),
    )

    total_users = total_users_result.scalar()
    total_restaurants = total_restaurants_result.scalar()
    active_riders = active_riders_result.scalar()
    orders_today = orders_today_result.scalar()
    revenue_today = revenue_today_result.scalar()

    # Recent orders (depends on nothing, but runs after for clarity)
    recent_orders_result = await db.execute(
        select(Order)
        .options(selectinload(Order.restaurant))
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    recent_orders = recent_orders_result.scalars().all()

    return {
        "total_users": total_users,
        "total_restaurants": total_restaurants,
        "active_riders": active_riders,
        "orders_today": orders_today,
        "revenue_today": float(revenue_today),
        "recent_orders": [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "restaurant_name": o.restaurant.name if o.restaurant else None,
                "total_amount": o.total_amount,
                "status": o.status.value,
                "created_at": o.created_at.isoformat(),
            }
            for o in recent_orders
        ],
    }


# User Management
@router.get("/users", response_model=list[UserResponse])
async def list_all_users(
    role: UserRole | None = Query(None),
    is_active: bool | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    query = select(User)

    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)

    query = (
        query.offset((page - 1) * limit).limit(limit).order_by(User.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle user active status."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundException("User not found")

    user.is_active = not user.is_active
    await db.commit()

    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


# Restaurant Management
@router.get("/restaurants", response_model=list[RestaurantResponse])
async def list_all_restaurants(
    is_active: bool | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all restaurants (admin only)."""
    query = select(Restaurant)

    if is_active is not None:
        query = query.where(Restaurant.is_active == is_active)

    query = (
        query.offset((page - 1) * limit)
        .limit(limit)
        .order_by(Restaurant.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/restaurants/{restaurant_id}/toggle-active")
async def toggle_restaurant_active(
    restaurant_id: UUID,
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle restaurant active status."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()

    if not restaurant:
        raise NotFoundException("Restaurant not found")

    restaurant.is_active = not restaurant.is_active
    await db.commit()

    return {
        "message": f"Restaurant {'activated' if restaurant.is_active else 'deactivated'}"
    }


# Rider Management
@router.get("/riders", response_model=list[RiderResponse])
async def list_all_riders(
    is_online: bool | None = Query(None),
    is_available: bool | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all riders (admin only)."""
    query = select(Rider)

    if is_online is not None:
        query = query.where(Rider.is_online == is_online)
    if is_available is not None:
        query = query.where(Rider.is_available == is_available)

    query = (
        query.offset((page - 1) * limit).limit(limit).order_by(Rider.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


# Analytics
@router.get("/analytics")
async def get_analytics(
    days: int = Query(30, ge=1, le=90),
    current_admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics data."""
    start_date = datetime.utcnow() - timedelta(days=days)

    # Orders in period
    orders_result = await db.execute(
        select(Order).where(Order.created_at >= start_date)
    )
    orders = orders_result.scalars().all()

    total_orders = len(orders)
    total_revenue = sum(
        o.total_amount for o in orders if o.payment_status == "completed"
    )

    # Orders by status
    orders_by_status = {}
    for status in [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
    ]:
        orders_by_status[status] = len([o for o in orders if o.status.value == status])

    # Daily orders
    daily_data = {}
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=i)).date()
        daily_data[date.isoformat()] = len(
            [o for o in orders if o.created_at.date() == date]
        )

    return {
        "period_days": days,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "orders_by_status": orders_by_status,
        "daily_orders": daily_data,
    }
