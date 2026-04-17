from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.api.v1.router import api_router as api_v1_router

logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"Starting {settings.app_name} API v{settings.api_version}")
    print(f"Environment: {settings.environment}")
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
    return JSONResponse({
        "name": settings.app_name,
        "version": settings.api_version,
        "status": "running",
        "docs": "/docs"
    })


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Include API v1 routes
app.include_router(api_v1_router, prefix="/api/v1")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
