from datetime import datetime, date
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
    from app.demo_models.order import Order, OrderItem
    from app.demo_models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.demo_models.user import User
    from app.demo_models.rider import Rider
else:
    from app.models.order import Order, OrderItem
    from app.models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.models.user import User
    from app.models.rider import Rider

from app.api.v1.deps import get_current_user
from app.core.enums import OrderStatus, OrderStatusTransitions, UserRole
from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.core.security import require_roles
from app.schemas.common import PaginatedResponse
from app.schemas.order import OrderBrief, OrderResponse
from app.schemas.rider import RiderResponse
from app.schemas.vendor import (
    EarningsEntry,
    EarningsResponse,
    VendorDashboardStats,
    VendorOrderResponse,
)

router = APIRouter()


async def get_restaurant_for_owner(
    owner_id: UUID, db: AsyncSession
) -> Restaurant:
    """Get restaurant owned by user ID."""
    result = await db.execute(
        select(Restaurant).where(Restaurant.owner_id == owner_id)
    )
    restaurant = result.scalar_one_or_none()

    if not restaurant:
        raise NotFoundException("You don't have a registered restaurant")

    return restaurant


@router.get("/dashboard", response_model=VendorDashboardStats)
async def get_vendor_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get vendor dashboard statistics."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    # Orders today
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(
            Order.restaurant_id == restaurant.id,
            Order.created_at >= today_start,
            Order.created_at <= today_end,
        )
    )
    orders_today = result.scalar() or 0

    # Pending orders
    result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(
            Order.restaurant_id == restaurant.id,
            Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED]),
        )
    )
    orders_pending = result.scalar() or 0

    # Revenue today
    result = await db.execute(
        select(func.sum(Order.total_amount))
        .select_from(Order)
        .where(
            Order.restaurant_id == restaurant.id,
            Order.created_at >= today_start,
            Order.created_at <= today_end,
            Order.status == OrderStatus.DELIVERED,
        )
    )
    revenue_today = result.scalar() or 0.0

    # Revenue this week
    from datetime import timedelta

    week_start = today - timedelta(days=today.weekday())
    week_start_dt = datetime.combine(week_start, datetime.min.time())

    result = await db.execute(
        select(func.sum(Order.total_amount))
        .select_from(Order)
        .where(
            Order.restaurant_id == restaurant.id,
            Order.created_at >= week_start_dt,
            Order.status == OrderStatus.DELIVERED,
        )
    )
    revenue_week = result.scalar() or 0.0

    return VendorDashboardStats(
        orders_today=orders_today,
        orders_pending=orders_pending,
        revenue_today=revenue_today,
        revenue_week=revenue_week,
        rating=restaurant.rating or 0.0,
        review_count=restaurant.review_count or 0,
    )


@router.get("/orders", response_model=PaginatedResponse)
async def get_vendor_orders(
    status: OrderStatus | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get vendor's restaurant orders."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    query = select(Order).where(Order.restaurant_id == restaurant.id)

    if status:
        query = query.where(Order.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    query = (
        query.offset((page - 1) * limit)
        .limit(limit)
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(query.options(selectinload(Order.customer)))
    orders = result.scalars().all()

    items = [
        VendorOrderResponse(
            id=str(order.id),
            order_number=order.order_number,
            customer_name=order.customer.full_name or order.customer.email,
            status=order.status.value,
            total_amount=order.total_amount,
            items_count=len(order.items) if order.items else 0,
            placed_at=order.placed_at,
            delivery_address=order.delivery_address.address_line if order.delivery_address else "",
        )
        for order in orders
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def update_vendor_order_status(
    order_id: UUID,
    status_update: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update order status from vendor side (confirm/prepare/ready)."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.restaurant_id == restaurant.id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise NotFoundException("Order not found")

    # Parse status
    try:
        new_status = OrderStatus(status_update)
    except ValueError:
        raise BadRequestException(f"Invalid status: {status_update}")

    # Validate transition
    if not OrderStatusTransitions.can_transition(order.status, new_status):
        raise BadRequestException(
            f"Cannot transition from {order.status} to {new_status}"
        )

    # Vendor can only confirm/prepare/ready
    vendor_statuses = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY]
    if new_status not in vendor_statuses:
        raise ForbiddenException("Vendor can only confirm, prepare, or mark ready")

    order.status = new_status

    # Set timestamps
    if new_status == OrderStatus.CONFIRMED:
        order.confirmed_at = datetime.utcnow()
    elif new_status == OrderStatus.PREPARING:
        order.preparing_at = datetime.utcnow()
    elif new_status == OrderStatus.READY:
        order.ready_at = datetime.utcnow()

    await db.commit()
    await db.refresh(order)

    return order


@router.get("/menu")
async def get_vendor_menu(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get vendor's restaurant menu with categories and items."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    result = await db.execute(
        select(MenuCategory)
        .options(selectinload(MenuCategory.items))
        .where(MenuCategory.restaurant_id == restaurant.id)
        .order_by(MenuCategory.sort_order)
    )
    categories = result.scalars().all()

    return [
        {
            "id": str(cat.id),
            "name": cat.name,
            "description": cat.description,
            "sort_order": cat.sort_order,
            "is_active": cat.is_active,
            "items": [
                {
                    "id": str(item.id),
                    "name": item.name,
                    "description": item.description,
                    "price": item.price,
                    "is_veg": item.is_veg,
                    "is_available": item.is_available,
                    "is_featured": item.is_featured,
                    "image_url": item.image_url,
                    "preparation_time_minutes": item.preparation_time_minutes,
                }
                for item in cat.items
            ],
        }
        for cat in categories
    ]


@router.post("/menu/categories")
async def create_menu_category(
    name: str,
    description: str | None = None,
    sort_order: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new menu category."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    category = MenuCategory(
        restaurant_id=restaurant.id,
        name=name,
        description=description,
        sort_order=sort_order,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)

    return {"id": str(category.id), "name": category.name}


@router.patch("/menu/categories/{category_id}")
async def update_menu_category(
    category_id: UUID,
    name: str | None = None,
    description: str | None = None,
    sort_order: int | None = None,
    is_active: bool | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a menu category."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id,
            MenuCategory.restaurant_id == restaurant.id,
        )
    )
    category = result.scalar_one_or_none()

    if not category:
        raise NotFoundException("Category not found")

    if name is not None:
        category.name = name
    if description is not None:
        category.description = description
    if sort_order is not None:
        category.sort_order = sort_order
    if is_active is not None:
        category.is_active = is_active

    await db.commit()
    await db.refresh(category)

    return {"id": str(category.id), "name": category.name}


@router.delete("/menu/categories/{category_id}")
async def delete_menu_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a menu category."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id,
            MenuCategory.restaurant_id == restaurant.id,
        )
    )
    category = result.scalar_one_or_none()

    if not category:
        raise NotFoundException("Category not found")

    await db.delete(category)
    await db.commit()

    return {"success": True}


@router.post("/menu/items")
async def create_menu_item(
    category_id: UUID,
    name: str,
    price: float,
    description: str | None = None,
    image_url: str | None = None,
    is_veg: bool = True,
    is_available: bool = True,
    is_featured: bool = False,
    preparation_time_minutes: int = 30,
    calories: int | None = None,
    tags: list[str] | None = None,
    sort_order: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new menu item."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    # Verify category belongs to this restaurant
    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id,
            MenuCategory.restaurant_id == restaurant.id,
        )
    )
    if not result.scalar_one_or_none():
        raise NotFoundException("Category not found")

    item = MenuItem(
        restaurant_id=restaurant.id,
        category_id=category_id,
        name=name,
        price=price,
        description=description,
        image_url=image_url,
        is_veg=is_veg,
        is_available=is_available,
        is_featured=is_featured,
        preparation_time_minutes=preparation_time_minutes,
        calories=calories,
        tags=tags,
        sort_order=sort_order,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return {"id": str(item.id), "name": item.name}


@router.patch("/menu/items/{item_id}")
async def update_menu_item(
    item_id: UUID,
    name: str | None = None,
    price: float | None = None,
    description: str | None = None,
    image_url: str | None = None,
    is_veg: bool | None = None,
    is_available: bool | None = None,
    is_featured: bool | None = None,
    preparation_time_minutes: int | None = None,
    calories: int | None = None,
    tags: list[str] | None = None,
    sort_order: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a menu item."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == item_id,
            MenuItem.restaurant_id == restaurant.id,
        )
    )
    item = result.scalar_one_or_none()

    if not item:
        raise NotFoundException("Item not found")

    update_data = {
        "name": name,
        "price": price,
        "description": description,
        "image_url": image_url,
        "is_veg": is_veg,
        "is_available": is_available,
        "is_featured": is_featured,
        "preparation_time_minutes": preparation_time_minutes,
        "calories": calories,
        "tags": tags,
        "sort_order": sort_order,
    }

    for field, value in update_data.items():
        if value is not None:
            setattr(item, field, value)

    await db.commit()
    await db.refresh(item)

    return {"id": str(item.id), "name": item.name}


@router.patch("/menu/items/{item_id}/availability")
async def toggle_item_availability(
    item_id: UUID,
    is_available: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle menu item availability."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == item_id,
            MenuItem.restaurant_id == restaurant.id,
        )
    )
    item = result.scalar_one_or_none()

    if not item:
        raise NotFoundException("Item not found")

    item.is_available = is_available
    await db.commit()

    return {"id": str(item.id), "is_available": item.is_available}


@router.delete("/menu/items/{item_id}")
async def delete_menu_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a menu item."""
    restaurant = await get_restaurant_for_owner(current_user.id, db)

    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == item_id,
            MenuItem.restaurant_id == restaurant.id,
        )
    )
    item = result.scalar_one_or_none()

    if not item:
        raise NotFoundException("Item not found")

    await db.delete(item)
    await db.commit()

    return {"success": True}


@router.get("/earnings")
async def get_vendor_earnings(
    period: str = Query("week", pattern="^(day|week|month)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get vendor earnings history."""
    from datetime import timedelta

    restaurant = await get_restaurant_for_owner(current_user.id, db)
    today = date.today()

    if period == "day":
        period_start = today
        period_end = today
    elif period == "week":
        period_start = today - timedelta(days=today.weekday())
        period_end = today
    else:
        period_start = today.replace(day=1)
        period_end = today

    period_start_dt = datetime.combine(period_start, datetime.min.time())
    period_end_dt = datetime.combine(period_end, datetime.max.time())

    # Get orders in period
    result = await db.execute(
        select(Order)
        .where(
            Order.restaurant_id == restaurant.id,
            Order.created_at >= period_start_dt,
            Order.created_at <= period_end_dt,
            Order.status == OrderStatus.DELIVERED,
        )
        .order_by(Order.created_at)
    )
    orders = result.scalars().all()

    # Group by date
    earnings_by_date = {}
    for order in orders:
        order_date = order.created_at.date()
        if order_date not in earnings_by_date:
            earnings_by_date[order_date] = {"count": 0, "revenue": 0.0}
        earnings_by_date[order_date]["count"] += 1
        earnings_by_date[order_date]["revenue"] += order.total_amount

    entries = [
        EarningsEntry(date=d, orders_count=data["count"], revenue=data["revenue"])
        for d, data in sorted(earnings_by_date.items())
    ]

    total_earnings = sum(e.revenue for e in entries)

    return EarningsResponse(
        total_earnings=total_earnings,
        period_start=period_start,
        period_end=period_end,
        entries=entries,
    )


@router.patch("/restaurant")
async def update_restaurant_details(
    name: str | None = None,
    description: str | None = None,
    cuisine_type: str | None = None,
    phone: str | None = None,
    email: str | None = None,
    delivery_fee: float | None = None,
    minimum_order: float | None = None,
    is_open: bool | None = None,
    opening_time: str | None = None,
    closing_time: str | None = None,
    delivery_radius_km: float | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update restaurant details."""
    from datetime import time

    restaurant = await get_restaurant_for_owner(current_user.id, db)

    if name is not None:
        restaurant.name = name
    if description is not None:
        restaurant.description = description
    if cuisine_type is not None:
        restaurant.cuisine_type = cuisine_type
    if phone is not None:
        restaurant.phone = phone
    if email is not None:
        restaurant.email = email
    if delivery_fee is not None:
        restaurant.delivery_fee = delivery_fee
    if minimum_order is not None:
        restaurant.minimum_order = minimum_order
    if is_open is not None:
        restaurant.is_open = is_open
    if opening_time is not None:
        parts = opening_time.split(":")
        restaurant.opening_time = time(int(parts[0]), int(parts[1]))
    if closing_time is not None:
        parts = closing_time.split(":")
        restaurant.closing_time = time(int(parts[0]), int(parts[1]))
    if delivery_radius_km is not None:
        restaurant.delivery_radius_km = delivery_radius_km

    await db.commit()
    await db.refresh(restaurant)

    return {"id": str(restaurant.id), "name": restaurant.name}
