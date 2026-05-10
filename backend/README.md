# Backend - AndhraEssence API

FastAPI backend for the AndhraEssence food delivery platform.

## Quick Start

```bash
# Install dependencies
poetry install

# Run development server (SQLite, no external DB)
DEMO_MODE=true poetry run uvicorn app.main:app --reload --port 8000

# API docs: http://localhost:8000/docs
```

## Commands

```bash
# Run development server
poetry run uvicorn app.main:app --reload --port 8000

# Run with PostgreSQL (set DATABASE_URL in .env first)
poetry run uvicorn app.main:app --reload --port 8000

# Run tests
poetry run pytest

# Run single test file
poetry run pytest tests/test_auth.py

# Run with coverage
poetry run pytest --cov=app --cov-report=term-missing

# Database migrations
poetry run alembic upgrade head

# Create new migration
poetry run alembic revision --autogenerate -m "migration description"

# Linting
poetry run ruff check .

# Format code
poetry run black .

# Type check
poetry run mypy app
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=sqlite:///./andraessence_demo.db
# For PostgreSQL: postgresql://user:password@localhost:5432/andhraessence

# Demo mode (uses SQLite regardless of DATABASE_URL)
DEMO_MODE=true

# Security
SECRET_KEY=your-super-secret-key-change-in-production

# Redis (for Celery)
REDIS_URL=redis://localhost:6379

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

## Demo Mode

When `DEMO_MODE=true`:
- Uses SQLite database (`andraessence_demo.db`)
- Includes seeded test data (restaurants, menu items, users)
- No external dependencies needed

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Settings and environment
│   ├── api/
│   │   └── v1/
│   │       ├── router.py # API v1 routes
│   │       └── endpoints/ # Route handlers
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── core/             # Auth, security, database
│   └── workers/          # Celery tasks
├── alembic/              # Database migrations
├── scripts/              # Utility scripts
├── tests/                # Test files
└── pyproject.toml        # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Restaurants
- `GET /api/v1/restaurants` - List restaurants
- `GET /api/v1/restaurants/{id}` - Restaurant details
- `GET /api/v1/restaurants/{id}/menu` - Restaurant menu

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/{id}` - Order details
- `PATCH /api/v1/orders/{id}/status` - Update order status

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add item
- `PATCH /api/v1/cart/items/{id}` - Update quantity
- `DELETE /api/v1/cart/items/{id}` - Remove item

## Testing

```bash
# Run all tests
poetry run pytest

# Run with verbose output
poetry run pytest -v

# Run specific test
poetry run pytest tests/test_auth.py::test_login

# Run tests in watch mode
poetry run pytest -w
```

## Docker

```bash
# Build image
docker build -t andhraessence-backend .

# Run container
docker run -p 8000:8000 --env-file .env andhraessence-backend
```

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLAlchemy + PostgreSQL/SQLite
- **Migrations**: Alembic
- **Task Queue**: Celery + Redis
- **Auth**: JWT tokens
- **Validation**: Pydantic