"""Initialize database tables - compatible with both PostgreSQL and SQLite.

For demo mode (SQLite), this script imports from demo_models.
For production mode (PostgreSQL), it imports from the regular models.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings
from app.database import Base, engine

settings = get_settings()

# Import from demo_models if in demo mode, otherwise from regular models
if settings.demo_mode:
    from app.demo_models import *  # noqa: F401, F403
else:
    from app.models import *  # noqa: F401, F403


async def init_db():
    """Create all database tables."""
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")
    print(
        f"Database type: {'SQLite (demo mode)' if settings.demo_mode else 'PostgreSQL'}"
    )


if __name__ == "__main__":
    asyncio.run(init_db())
