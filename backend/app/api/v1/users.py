from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.config import get_settings
settings = get_settings()

# Use demo_models in demo mode
if settings.demo_mode:
    from app.demo_models.user import User, Address
else:
    from app.models.user import User, Address

from app.schemas.user import (
    UserResponse, UserUpdate, AddressCreate, AddressUpdate, AddressResponse
)
from app.core.security import decode_token, oauth2_scheme
from app.core.exceptions import NotFoundException, ForbiddenException, UnauthorizedException

router = APIRouter()


async def get_current_user_dependency(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user."""
    if not token:
        raise UnauthorizedException("Not authenticated")
    payload = decode_token(token)
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user_dependency)):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile."""
    update_data = user_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user


# Address endpoints
@router.get("/me/addresses", response_model=List[AddressResponse])
async def get_addresses(
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """Get user's addresses."""
    result = await db.execute(
        select(Address).where(Address.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/me/addresses", response_model=AddressResponse)
async def create_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """Create a new address."""
    # If this is the default address, unset other defaults
    if address_data.is_default:
        result = await db.execute(
            select(Address).where(
                Address.user_id == current_user.id,
                Address.is_default == True
            )
        )
        for addr in result.scalars():
            addr.is_default = False

    address = Address(
        user_id=current_user.id,
        **address_data.model_dump()
    )
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


@router.get("/me/addresses/{address_id}", response_model=AddressResponse)
async def get_address(
    address_id: str,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific address."""
    result = await db.execute(
        select(Address).where(
            Address.id == address_id,
            Address.user_id == current_user.id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundException("Address not found")
    return address


@router.put("/me/addresses/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: str,
    address_data: AddressUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """Update an address."""
    result = await db.execute(
        select(Address).where(
            Address.id == address_id,
            Address.user_id == current_user.id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundException("Address not found")

    update_data = address_data.model_dump(exclude_unset=True)

    # If setting as default, unset other defaults
    if update_data.get("is_default"):
        result = await db.execute(
            select(Address).where(
                Address.user_id == current_user.id,
                Address.is_default == True,
                Address.id != address_id
            )
        )
        for addr in result.scalars():
            addr.is_default = False

    for field, value in update_data.items():
        setattr(address, field, value)

    await db.commit()
    await db.refresh(address)
    return address


@router.delete("/me/addresses/{address_id}")
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """Delete an address."""
    result = await db.execute(
        select(Address).where(
            Address.id == address_id,
            Address.user_id == current_user.id
        )
    )
    address = result.scalar_one_or_none()
    if not address:
        raise NotFoundException("Address not found")

    await db.delete(address)
    await db.commit()
    return {"message": "Address deleted successfully"}
