from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

from app.database import get_db
from app.config import get_settings

settings = get_settings()

# Use demo_models when in demo mode, otherwise regular models
if settings.demo_mode:
    from app.demo_models.user import User, Address
else:
    from app.models.user import User, Address

from app.schemas.auth import (
    UserRegister, UserLogin, TokenResponse, RefreshTokenRequest,
    PasswordResetRequest, PasswordResetConfirm, ChangePasswordRequest
)
from app.schemas.user import UserResponse
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, decode_token, oauth2_scheme
)
from app.core.exceptions import UnauthorizedException, BadRequestException, NotFoundException
from app.core.enums import UserRole

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise BadRequestException("Email already registered")

    result = await db.execute(select(User).where(User.phone == user_data.phone))
    if result.scalar_one_or_none():
        raise BadRequestException("Phone number already registered")

    user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=UserRole(user_data.role)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token_data = {"sub": str(user.id), "role": user.role.value, "email": user.email}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedException("Account is deactivated")

    token_data = {"sub": str(user.id), "role": user.role.value, "email": user.email}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    try:
        payload = decode_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")

        result = await db.execute(select(User).where(User.id == payload.get("sub")))
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")

        token_data = {"sub": str(user.id), "role": user.role.value, "email": user.email}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
            expires_in=settings.access_token_expire_minutes * 60
        )
    except Exception:
        raise UnauthorizedException("Invalid refresh token")


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    """Logout user and blacklist the token."""
    from app.core.security import blacklist_token, decode_token

    try:
        payload = decode_token(token, check_blacklist=False)
        exp = payload.get("exp")
        if exp:
            # Calculate TTL: token expiry time - current time
            exp_time = datetime.fromtimestamp(exp)
            ttl = int((exp_time - datetime.utcnow()).total_seconds())
            if ttl > 0:
                await blacklist_token(token, ttl)
    except Exception:
        pass  # If token is invalid, just return success

    return {"message": "Logged out successfully"}


@router.post("/password-reset")
async def password_reset_request(request: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """Request password reset."""
    from app.config import get_settings
    import redis.asyncio as aioredis
    import json
    import uuid

    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset link has been sent"}

    settings = get_settings()

    # Generate reset token
    reset_token = str(uuid.uuid4())
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "type": "password_reset"
    }

    # Store token in Redis with TTL from settings
    try:
        redis = await aioredis.from_url(settings.redis_url)
        await redis.setex(
            f"password_reset:{reset_token}",
            settings.redis_cache_ttl,
            json.dumps(token_data)
        )
        await redis.close()
    except Exception:
        pass  # Redis not available, continue anyway

    # TODO: Send reset email with token via SMTP
    # For now, log the token for development
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Password reset token for {user.email}: {reset_token}")

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/password-reset/confirm")
async def password_reset_confirm(request: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    """Confirm password reset with token."""
    from app.config import get_settings
    import redis.asyncio as aioredis
    import json

    settings = get_settings()

    # Verify token from Redis
    try:
        redis = await aioredis.from_url(settings.redis_url)
        token_data = await redis.get(f"password_reset:{request.token}")
        await redis.close()

        if not token_data:
            raise BadRequestException("Invalid or expired reset token")

        data = json.loads(token_data)
        user_id = data.get("user_id")
    except Exception:
        raise BadRequestException("Invalid or expired reset token")

    # Find user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise BadRequestException("Invalid or expired reset token")

    # Update password
    user.password_hash = get_password_hash(request.new_password)
    await db.commit()

    # Delete the reset token
    try:
        redis = await aioredis.from_url(settings.redis_url)
        await redis.delete(f"password_reset:{request.token}")
        await redis.close()
    except Exception:
        pass

    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """Get current authenticated user."""
    if not token:
        raise UnauthorizedException()

    payload = decode_token(token)
    user_id = payload.get("sub")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise NotFoundException("User not found")

    return user
