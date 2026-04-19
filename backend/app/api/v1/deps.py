"""Shared dependencies for API routes."""

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.exceptions import NotFoundException, UnauthorizedException
from app.core.security import decode_token, oauth2_scheme
from app.database import get_db

settings = get_settings()

# Use demo_models in demo mode, otherwise regular models
if settings.demo_mode:
    from app.demo_models.user import User
else:
    from app.models.user import User


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    if not token:
        raise UnauthorizedException("Not authenticated")

    payload = decode_token(token)
    user_id = payload.get("sub")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundException("User not found")

    return user
