from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db

settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.demo_models.user import User
else:
    from app.models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.models.user import User

from app.api.v1.deps import get_current_user
from app.core.enums import UserRole
from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.schemas.restaurant import (
    MenuCategoryCreate,
    MenuCategoryResponse,
    MenuCategoryUpdate,
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
)

router = APIRouter()


async def get_restaurant_or_404(restaurant_id: UUID, db: AsyncSession) -> Restaurant:
    """Get restaurant or raise 404."""
    result = await db.execute(select(Restaurant).where(Restaurant.id == restaurant_id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise NotFoundException("Restaurant not found")
    return restaurant


async def verify_restaurant_owner(restaurant: Restaurant, user: User):
    """Verify user is the restaurant owner."""
    if restaurant.owner_id != user.id and user.role != UserRole.ADMIN:
        raise ForbiddenException(
            "You don't have permission to manage this restaurant's menu"
        )


# Category endpoints
@router.post(
    "/restaurants/{restaurant_id}/categories", response_model=MenuCategoryResponse
)
async def create_category(
    restaurant_id: UUID,
    category_data: MenuCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a menu category."""
    restaurant = await get_restaurant_or_404(restaurant_id, db)
    await verify_restaurant_owner(restaurant, current_user)

    category = MenuCategory(restaurant_id=restaurant_id, **category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=MenuCategoryResponse)
async def update_category(
    category_id: UUID,
    category_data: MenuCategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a menu category."""
    result = await db.execute(
        select(MenuCategory).where(MenuCategory.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise NotFoundException("Category not found")

    restaurant = await get_restaurant_or_404(category.restaurant_id, db)
    await verify_restaurant_owner(restaurant, current_user)

    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a menu category."""
    result = await db.execute(
        select(MenuCategory).where(MenuCategory.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise NotFoundException("Category not found")

    restaurant = await get_restaurant_or_404(category.restaurant_id, db)
    await verify_restaurant_owner(restaurant, current_user)

    await db.delete(category)
    await db.commit()

    return {"message": "Category deleted successfully"}


# Menu Item endpoints
@router.get("/restaurants/{restaurant_id}/items", response_model=list[MenuItemResponse])
async def get_menu_items(restaurant_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get all menu items for a restaurant (public endpoint)."""
    # Verify restaurant exists
    await get_restaurant_or_404(restaurant_id, db)

    result = await db.execute(
        select(MenuItem).where(
            MenuItem.restaurant_id == restaurant_id, MenuItem.is_available == True
        )
    )
    items = result.scalars().all()
    return items


@router.post("/restaurants/{restaurant_id}/items", response_model=MenuItemResponse)
async def create_menu_item(
    restaurant_id: UUID,
    item_data: MenuItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a menu item."""
    restaurant = await get_restaurant_or_404(restaurant_id, db)
    await verify_restaurant_owner(restaurant, current_user)

    # Verify category belongs to restaurant
    if item_data.category_id:
        result = await db.execute(
            select(MenuCategory).where(
                MenuCategory.id == item_data.category_id,
                MenuCategory.restaurant_id == restaurant_id,
            )
        )
        if not result.scalar_one_or_none():
            raise BadRequestException("Invalid category for this restaurant")

    item = MenuItem(restaurant_id=restaurant_id, **item_data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: UUID,
    item_data: MenuItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a menu item."""
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()

    if not item:
        raise NotFoundException("Menu item not found")

    restaurant = await get_restaurant_or_404(item.restaurant_id, db)
    await verify_restaurant_owner(restaurant, current_user)

    update_data = item_data.model_dump(exclude_unset=True)

    # Verify category if being updated
    if update_data.get("category_id"):
        result = await db.execute(
            select(MenuCategory).where(
                MenuCategory.id == update_data["category_id"],
                MenuCategory.restaurant_id == item.restaurant_id,
            )
        )
        if not result.scalar_one_or_none():
            raise BadRequestException("Invalid category for this restaurant")

    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/items/{item_id}")
async def delete_menu_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a menu item."""
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()

    if not item:
        raise NotFoundException("Menu item not found")

    restaurant = await get_restaurant_or_404(item.restaurant_id, db)
    await verify_restaurant_owner(restaurant, current_user)

    await db.delete(item)
    await db.commit()

    return {"message": "Menu item deleted successfully"}
