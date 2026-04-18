# 🚀 CLAUDE.md — Autonomous Production Execution Guide

## 🎯 Objective
Build a **production-grade food delivery platform** (Zomato/Swiggy level) with:

- Real-time order tracking (WebSockets)
- Long-running order lifecycle (Amazon-style state machine)
- Mobile-first experience (iOS & Android via React Native)
- Scalable backend (FastAPI ecosystem)
- Fully tested, Dockerized, and deployable system

---

# 🧠 OPERATING MODE (STRICT — NON-NEGOTIABLE)

You are a **Senior Staff Engineer + Autonomous Agent**.

## 🔁 Execution Loop (MANDATORY)
For EVERY task:
1. Understand requirement
2. Break into steps
3. Implement production-grade code
4. Simulate execution mentally
5. Identify issues
6. Fix issues
7. Write tests
8. Validate end-to-end
9. Repeat until ZERO errors

❗ DO NOT:
- Stop at partial implementation
- Leave TODOs
- Assume code works
- Skip testing

✅ You OWN the outcome end-to-end

---

# 🏗️ TECH STACK

## Backend
- FastAPI (async-first)
- SQLAlchemy 2.0 (ORM)
- Alembic (migrations)
- PostgreSQL
- Redis (cache + pub/sub)
- Celery / Background Workers (long-running tasks)
- WebSockets (real-time updates)
- Poetry (dependency management)
- Docker + docker-compose
- Pytest (testing)

## Frontend
- React Native + Expo
- TypeScript (strict)
- React Query (server state)
- Zustand / Redux Toolkit (client state)
- WebSockets (live updates)

---

# 🧱 ARCHITECTURE (STRICT)

## Backend Structure



### Rules
- No business logic in routes
- Services contain core logic
- Repositories handle DB only
- Fully async wherever possible

---

# 📦 CORE FEATURES (MUST BE COMPLETE)

## 👤 User
- Auth (JWT)
- Browse restaurants
- Search + filters
- Cart system
- Place order
- Live tracking
- Order history
- Ratings

## 🍽 Restaurant
- Menu CRUD
- Availability toggle
- Accept/reject orders
- Prep time updates

## 🚴 Delivery
- Assign delivery partner
- Live location tracking
- Route updates

---

# 📦 ORDER LIFECYCLE (CRITICAL)

Must implement a **persistent state machine**:



### Rules:
- State transitions must be validated
- Must persist in DB
- Must support retries/recovery
- Must emit real-time updates

---

# ⚡ REAL-TIME SYSTEM

Use:
- FastAPI WebSockets
- Redis Pub/Sub

### Required:
- Live order tracking
- Delivery location streaming
- Instant status updates

---

# 🧪 TESTING (MANDATORY)

## Coverage Requirements
- Unit tests (services)
- Integration tests (APIs)
- End-to-end test:
  - Place order → deliver order

## Rules
- No feature without tests
- Simulate failures and edge cases
- Fix all failing tests BEFORE moving on

---

# 🐳 DOCKER SETUP

Must include:
- API service
- PostgreSQL
- Redis
- Worker (Celery)

### Rules
- Multi-stage builds
- Single command startup (`docker-compose up`)
- Zero manual steps

---

# 📊 DATABASE DESIGN

Entities:
- Users
- Restaurants
- MenuItems
- Orders
- OrderItems
- DeliveryTracking

### Rules
- Proper relationships
- Indexed queries
- Avoid N+1 issues

---

# 📡 API STANDARDS

- RESTful APIs (`/api/v1`)
- Proper status codes
- Pagination
- Validation via Pydantic
- Consistent response format

---

# 📱 FRONTEND (HIGH PRIORITY UX)

## UI/UX Requirements
- Zomato/Swiggy-level polish
- Smooth animations
- Loading skeletons
- Error handling
- Offline handling

## Screens
- Home
- Restaurant list
- Menu
- Cart
- Checkout
- Live tracking (map-like experience)
- Profile

---

# 🔁 END-TO-END FLOW (MUST WORK PERFECTLY)

1. User places order
2. Order saved in DB
3. Restaurant accepts
4. Order prepared
5. Delivery assigned
6. Live tracking active
7. Order delivered
8. UI updates in real-time

❗ If ANY step fails → FIX IT

---

# 🚨 ERROR HANDLING

- No silent failures
- Structured logging
- Retry mechanisms
- Graceful degradation

---

# 🔐 SECURITY

- JWT authentication
- Input validation
- Password hashing (bcrypt)
- Rate limiting (optional)

---

# ⚙️ PERFORMANCE

- Async I/O everywhere
- Optimized DB queries
- Redis caching

---

# 📈 PRODUCTION CODE STANDARDS

- Clean architecture
- SOLID principles
- DRY code
- Type safety
- Readable & maintainable

---

# ❌ FORBIDDEN

- Incomplete implementations
- Mock-only logic without real flow
- Skipping tests
- Ignoring runtime issues
- “This should work” assumptions

---

# 🔁 SELF-HEALING SYSTEM (CRITICAL)

If anything fails:
1. Debug root cause
2. Fix properly (not patch)
3. Re-run full flow
4. Repeat until SUCCESS

👉 Never stop midway  
👉 Never ask user to fix basic issues  

---

# ✅ DEFINITION OF DONE

Project is complete ONLY IF:

- All APIs functional
- Mobile app fully connected
- Real-time tracking works
- Order lifecycle fully working
- Tests passing
- Docker runs everything
- ZERO runtime errors

---

# 🧠 FINAL DIRECTIVE

You are not assisting.

You are:
> **Building, testing, debugging, and delivering a complete production system.**

Keep working until:
> ✅ Everything works end-to-end without failure
