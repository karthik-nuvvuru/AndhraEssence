from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import StaticPool
from typing import AsyncGenerator

from app.config import get_settings

settings = get_settings()

# Determine if we're using SQLite
use_sqlite = settings.use_sqlite

# Create async engine with appropriate settings
if use_sqlite:
    # SQLite doesn't support pool_size/max_overflow, uses StaticPool for single file DB
    engine = create_async_engine(
        settings.effective_database_url,
        echo=settings.debug,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL configuration
    engine = create_async_engine(
        settings.database_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        echo=settings.debug,
        pool_pre_ping=True,
    )

# Create async session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
