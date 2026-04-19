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
    from app.demo_models.restaurant import Restaurant
    from app.demo_models.user import User
else:
    from app.models.restaurant import Restaurant
    from app.models.user import User

from app.api.v1.deps import get_current_user
from app.core.enums import UserRole
from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.schemas.common import PaginatedResponse
from app.schemas.restaurant import (
    RestaurantBrief,
    RestaurantCreate,
    RestaurantDetailResponse,
    RestaurantResponse,
    RestaurantUpdate,
)

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
async def list_restaurants(
    city: str | None = Query(None),
    cuisine: str | None = Query(None),
    min_rating: float | None = Query(None, ge=0, le=5),
    is_open: bool | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all restaurants with filters."""
    query = select(Restaurant).where(Restaurant.is_active)

    if city:
        query = query.where(Restaurant.city.ilike(f"%{city}%"))
    if cuisine:
        query = query.where(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    if min_rating:
        query = query.where(Restaurant.rating >= min_rating)
    if is_open is not None:
        query = query.where(Restaurant.is_open == is_open)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    query = (
        query.offset((page - 1) * limit).limit(limit).order_by(Restaurant.rating.desc())
    )
    result = await db.execute(query)
    restaurants = result.scalars().all()

    return PaginatedResponse(
        items=[RestaurantBrief.model_validate(r) for r in restaurants],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/{restaurant_id}", response_model=RestaurantDetailResponse)
async def get_restaurant(restaurant_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get restaurant detail with menu."""
    result = await db.execute(
        select(Restaurant)
        .options(selectinload(Restaurant.categories), selectinload(Restaurant.owner))
        .where(Restaurant.id == restaurant_id)
    )
    restaurant = result.scalar_one_or_none()

    if not restaurant:
        raise NotFoundException("Restaurant not found")

    return restaurant


@router.post("", response_model=RestaurantResponse)
async def create_restaurant(
    restaurant_data: RestaurantCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new restaurant (restaurant owners only)."""
    if (
        current_user.role != UserRole.RESTAURANT_OWNER
        and current_user.role != UserRole.ADMIN
    ):
        raise ForbiddenException("Only restaurant owners can create restaurants")

    # Check if user already has a restaurant
    if current_user.restaurant:
        raise BadRequestException("You already own a restaurant")

    # Generate slug from name
    slug = restaurant_data.name.lower().replace(" ", "-")
    # TODO: Ensure slug uniqueness

    restaurant = Restaurant(
        owner_id=current_user.id, slug=slug, **restaurant_data.model_dump()
    )
    db.add(restaurant)
    await db.commit()
    await db.refresh(restaurant)
    return restaurant


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: UUID,
    restaurant_data: RestaurantUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a restaurant (owner only)."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()

    if not restaurant:
        raise NotFoundException("Restaurant not found")

    if restaurant.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise ForbiddenException("You don't have permission to update this restaurant")

    update_data = restaurant_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)

    await db.commit()
    await db.refresh(restaurant)
    return restaurant


@router.delete("/{restaurant_id}")
async def delete_restaurant(
    restaurant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a restaurant (owner only)."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()

    if not restaurant:
        raise NotFoundException("Restaurant not found")

    if restaurant.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise ForbiddenException("You don't have permission to delete this restaurant")

    # Soft delete
    restaurant.is_active = False
    await db.commit()

    return {"message": "Restaurant deleted successfully"}
