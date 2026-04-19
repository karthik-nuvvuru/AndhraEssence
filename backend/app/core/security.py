import logging
from datetime import datetime, timedelta

import redis.asyncio as aioredis
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


async def is_token_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted in Redis."""
    try:
        redis = await aioredis.from_url(settings.redis_url)
        result = await redis.exists(f"blacklist:{token}")
        await redis.close()
        return result > 0
    except Exception as e:
        logger.warning(f"Failed to check token blacklist in Redis: {e}")
        return False


async def blacklist_token(token: str, expires_in: int) -> None:
    """Add a token to the blacklist with TTL matching token expiry."""
    try:
        redis = await aioredis.from_url(settings.redis_url)
        await redis.setex(f"blacklist:{token}", expires_in, "1")
        await redis.close()
    except Exception as e:
        logger.warning(f"Failed to blacklist token in Redis (continuing anyway): {e}")


# Password hashing - use bcrypt directly to avoid passlib compatibility issues
import bcrypt

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire, "type": "access", "iat": datetime.utcnow()})
    return jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh", "iat": datetime.utcnow()})
    return jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )


def decode_token(token: str, check_blacklist: bool = True) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        # Skip blacklist in demo mode
        if check_blacklist and not settings.demo_mode:
            try:
                # Check blacklist synchronously using threading (non-blocking alternative)
                import threading

                result = [False]

                def check():
                    try:
                        import asyncio

                        loop = asyncio.new_event_loop()
                        result[0] = loop.run_until_complete(is_token_blacklisted(token))
                        loop.close()
                    except Exception:
                        pass

                t = threading.Thread(target=check)
                t.start()
                t.join(timeout=1)  # 1 second max wait
                if result[0]:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token has been revoked",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
            except HTTPException:
                raise
            except Exception as e:
                logger.warning(
                    f"Failed to check token blacklist in Redis (skipping check): {e}"
                )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


class TokenData:
    """Token payload data."""

    def __init__(self, user_id: str, role: str, exp: datetime):
        self.user_id = user_id
        self.role = role
        self.exp = exp


def get_token_data(token: str) -> TokenData:
    """Extract token data."""
    payload = decode_token(token)
    return TokenData(
        user_id=payload.get("sub"),
        role=payload.get("role"),
        exp=datetime.fromtimestamp(payload.get("exp")),
    )


# Role hierarchy for authorization
ROLE_HIERARCHY = {"customer": 1, "restaurant_owner": 2, "rider": 3, "admin": 4}


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str | None:
    """Get current user ID from token."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        return payload.get("sub")
    except HTTPException:
        return None


def require_roles(*allowed_roles: str):
    """Dependency factory for role-based access control."""

    async def role_checker(
        token: str = Depends(oauth2_scheme),
    ) -> dict:
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )

        payload = decode_token(token)
        user_role = payload.get("role")

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}",
            )

        return {
            "user_id": payload.get("sub"),
            "role": user_role,
            "email": payload.get("email"),
        }

    return role_checker
