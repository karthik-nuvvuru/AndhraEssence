import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.auth import limiter
from app.api.v1.router import api_router as api_v1_router
from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


async def check_redis_health() -> bool:
    """Check Redis connectivity at startup."""
    try:
        redis = await aioredis.from_url(settings.redis_url)
        await redis.ping()
        await redis.close()
        logger.info("Redis connection: healthy")
        return True
    except Exception as e:
        logger.warning(f"Redis connection: unavailable ({e})")
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"Starting {settings.app_name} API v{settings.api_version}")
    print(f"Environment: {settings.environment}")
    app.state.limiter = limiter
    await check_redis_health()
    yield
    # Shutdown
    print(f"Shutting down {settings.app_name} API")


app = FastAPI(
    title=settings.app_name,
    description="Food Delivery Platform API - Order from your favorite restaurants",
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add SlowAPI middleware for rate limiting
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return JSONResponse(
        {
            "name": settings.app_name,
            "version": settings.api_version,
            "status": "running",
            "docs": "/docs",
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    redis_healthy = await check_redis_health()
    return {
        "status": "healthy",
        "redis": "connected" if redis_healthy else "disconnected",
    }


# Include API v1 routes
app.include_router(api_v1_router, prefix="/api/v1")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
