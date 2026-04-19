# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AndhraEssence is a full-stack food delivery platform with:
- **Backend**: FastAPI + PostgreSQL/SQLite + Celery + Redis
- **Mobile**: React Native (Expo) with Expo Router
- **E2E Tests**: Playwright

## Common Commands

### Backend
```bash
cd backend

# Install dependencies
poetry install

# Run development server (uses SQLite when DEMO_MODE=true)
DEMO_MODE=true poetry run uvicorn app.main:app --reload --port 8000

# Run tests
poetry run pytest

# Run single test file
poetry run pytest tests/test_auth.py

# Database migrations
poetry run alembic upgrade head

# Linting
poetry run ruff check .
poetry run black .
```

### Mobile
```bash
cd mobile

# Start Expo dev server
npm start

# Run on iOS
npx expo run:ios

# Linting
npx expo lint
```

### E2E Tests
```bash
cd e2e

# Install dependencies
npm install

# Run tests (headless)
npm test

# Run with UI
npm run test:ui

# Run headed (visible browser)
npm run test:headed
```

### Full Stack (Docker)
```bash
docker-compose up  # Starts API, PostgreSQL, Redis, Celery, Nginx
```

## Architecture

### Backend (`backend/app/`)
- **FastAPI** app with Pydantic settings loaded from `.env`
- **Demo Mode**: Set `DEMO_MODE=true` to use SQLite instead of PostgreSQL (no external DB needed)
- **API v1 Routes**: `/api/v1` prefix via `app/api/v1/router.py`
- **Models** in `app/models/` using SQLAlchemy
- **Schemas** in `app/schemas/` for request/response validation
- **Core** in `app/core/` (auth, security, database session)
- **Workers** in `app/workers/` for Celery background tasks

### Mobile (`mobile/`)
- **Expo Router**: File-based routing via `app/` directory
  - `app/(tabs)/` - Bottom tab navigation (home, search, cart, orders, profile)
  - `app/auth/` - Authentication screens
  - `app/restaurant/[id].tsx` - Restaurant detail page
  - `app/checkout.tsx` - Checkout flow
- **State Management**: Zustand stores in `store/`
- **API Client**: Axios-based service layer in `services/api/`
- **Navigation**: React Navigation with bottom tabs and native stack

### E2E (`e2e/`)
- Playwright tests in `tests/` directory
- Screenshots captured in `screenshots/`
- Config: `playwright.config.ts`

## Key Files
- `backend/app/main.py` - FastAPI app entry point
- `backend/app/config.py` - Settings (environment variables)
- `mobile/app/_layout.tsx` - Root mobile layout
- `mobile/app/(tabs)/_layout.tsx` - Tab navigation layout
- `docker-compose.yml` - Full stack service definitions
