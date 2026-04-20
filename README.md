# AndhraEssence

A full-stack food delivery platform for Andhra cuisine, featuring a FastAPI backend and React Native (Expo) mobile app.

## Project Structure

```
AndhraEssence/
├── backend/          # FastAPI backend (Python)
├── mobile/           # React Native mobile app (Expo)
├── e2e/              # Playwright end-to-end tests
├── docker-compose.yml
└── nginx/            # Nginx configuration
```

## Quick Start

### Option 1: Docker (Full Stack)

```bash
# Start all services (API, PostgreSQL, Redis, Celery, Nginx)
docker-compose up

# API available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Option 2: Backend Only (Development)

```bash
cd backend

# Install dependencies
poetry install

# Run development server (uses SQLite in demo mode)
DEMO_MODE=true poetry run uvicorn app.main:app --reload --port 8000

# Run with PostgreSQL
# Set DATABASE_URL in .env, then:
poetry run uvicorn app.main:app --reload --port 8000

# Run tests
poetry run pytest

# Linting
poetry run ruff check .
```

### Option 3: Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS Simulator
npx expo run:ios

# Run on Android
npx expo run:android
```

### Option 4: E2E Tests

```bash
cd e2e

# Install dependencies
npm install

# Run tests (headless)
npm test

# Run with UI
npm run test:ui
```

## Backend Commands

```bash
cd backend

# Development server
DEMO_MODE=true poetry run uvicorn app.main:app --reload --port 8000

# Run tests
poetry run pytest

# Run single test
poetry run pytest tests/test_auth.py

# Database migrations
poetry run alembic upgrade head

# Create migration
poetry run alembic revision --autogenerate -m "description"

# Linting
poetry run ruff check .
poetry run black .
```

## Mobile Commands

```bash
cd mobile

# Start Expo
npm start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Build for production
npx expo export

# Linting
npx expo lint

# TypeScript check
npx tsc --noEmit
```

## API Documentation

When the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Architecture

### Backend (`backend/app/`)
- **FastAPI** with Pydantic settings
- **Database**: PostgreSQL (production) / SQLite (demo mode)
- **Background Tasks**: Celery + Redis
- **API Version**: `/api/v1`

### Mobile (`mobile/`)
- **Expo Router** for file-based routing
- **Zustand** for state management
- **Axios** for API client

### E2E (`e2e/`)
- **Playwright** for end-to-end testing
- Screenshots captured in `screenshots/`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=sqlite:///./andraessence_demo.db  # or postgresql://...
DEMO_MODE=true
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
```

### Mobile (.env)
```env
API_URL=http://localhost:8000
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | FastAPI |
| Database | PostgreSQL / SQLite |
| Task Queue | Celery + Redis |
| Mobile | React Native (Expo) |
| Routing | Expo Router |
| State | Zustand |
| Testing | Playwright |