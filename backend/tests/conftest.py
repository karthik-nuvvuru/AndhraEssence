"""Pytest configuration and shared fixtures."""
import asyncio
import os
import pytest
from httpx import AsyncClient, ASGITransport

# Set demo mode before importing app
os.environ["DEMO_MODE"] = "true"

from app.main import app
from app.config import get_settings

settings = get_settings()


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def client():
    """Create async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(client):
    """Register a test user and return the response."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "phone": "+1234567890",
        "full_name": "Test User",
        "role": "customer"
    })
    return response.json()


@pytest.fixture
async def db_session():
    """Get database session for direct DB operations."""
    from app.database import async_session_factory

    async with async_session_factory() as session:
        yield session


@pytest.fixture
async def seeded_db(db_session):
    """Ensure database is seeded with demo data."""
    from app.database import engine, Base
    from app.demo_models.user import User, Address
    from app.demo_models.restaurant import Restaurant, MenuCategory, MenuItem
    from app.demo_models.rider import Rider
    from app.core.security import get_password_hash
    from app.core.enums import UserRole
    from datetime import time
    import uuid

    # Drop and create tables fresh
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Create admin user
    admin = User(
        id=uuid.uuid4(),
        email="admin@andhraessence.com",
        phone="+919999999999",
        password_hash=get_password_hash("admin123"),
        full_name="Admin User",
        role=UserRole.ADMIN.value,
        is_verified=True,
    )
    db_session.add(admin)

    # Create customer user
    customer = User(
        id=uuid.uuid4(),
        email="customer@example.com",
        phone="+919999999998",
        password_hash=get_password_hash("customer123"),
        full_name="Test Customer",
        role=UserRole.CUSTOMER.value,
        is_verified=True,
    )
    db_session.add(customer)

    # Create customer address
    address = Address(
        id=uuid.uuid4(),
        user_id=customer.id,
        label="Home",
        address_line="123 Main Street",
        city="Hyderabad",
        state="Telangana",
        postal_code="500001",
        latitude=17.3850,
        longitude=78.4867,
        is_default=True,
    )
    db_session.add(address)

    # Create restaurant owner
    owner = User(
        id=uuid.uuid4(),
        email="restaurant@example.com",
        phone="+919999999997",
        password_hash=get_password_hash("owner123"),
        full_name="Restaurant Owner",
        role=UserRole.RESTAURANT_OWNER.value,
        is_verified=True,
    )
    db_session.add(owner)

    # Create restaurant
    restaurant = Restaurant(
        id=uuid.uuid4(),
        owner_id=owner.id,
        name="Andhra Spice",
        slug="andhra-spice",
        description="Authentic Andhra cuisine with rich flavors",
        cuisine_type="Andhra",
        address_line="456 Food Street",
        city="Hyderabad",
        state="Telangana",
        postal_code="500002",
        latitude=17.3900,
        longitude=78.4800,
        phone="+919999999990",
        email="info@andhraspice.com",
        rating=4.5,
        review_count=128,
        is_active=True,
        is_open=True,
        opening_time=time(9, 0),
        closing_time=time(22, 0),
        delivery_radius_km=5.0,
        minimum_order=200,
        delivery_fee=40,
    )
    db_session.add(restaurant)
    await db_session.flush()

    # Create menu categories and items
    categories_data = [
        ("Starters", "Appetizers and starters", [
            ("Chicken 65", "Spicy deep-fried chicken", 250, True),
            ("Paneer Tikka", "Grilled paneer cubes", 220, True),
        ]),
        ("Main Course", "Rice and curries", [
            ("Chicken Curry", "Traditional Andhra chicken curry", 280, False),
            ("Dal Fry", "Tempered lentil curry", 150, True),
        ]),
    ]

    for name, desc, items in categories_data:
        category = MenuCategory(
            id=uuid.uuid4(),
            restaurant_id=restaurant.id,
            name=name,
            description=desc,
            sort_order=0,
        )
        db_session.add(category)
        await db_session.flush()

        for item_name, item_desc, price, is_veg in items:
            menu_item = MenuItem(
                id=uuid.uuid4(),
                restaurant_id=restaurant.id,
                category_id=category.id,
                name=item_name,
                description=item_desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                is_featured=False,
                preparation_time_minutes=30,
            )
            db_session.add(menu_item)

    # Create rider
    rider_user = User(
        id=uuid.uuid4(),
        email="rider@example.com",
        phone="+919999999996",
        password_hash=get_password_hash("rider123"),
        full_name="Delivery Rider",
        role=UserRole.RIDER.value,
        is_verified=True,
    )
    db_session.add(rider_user)

    rider = Rider(
        id=uuid.uuid4(),
        user_id=rider_user.id,
        vehicle_type="bike",
        vehicle_number="TS 01 AB 1234",
        is_available=True,
        is_online=False,
    )
    db_session.add(rider)

    await db_session.commit()

    yield db_session


@pytest.fixture
async def admin_token(client, seeded_db):
    """Get admin access token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@andhraessence.com",
        "password": "admin123"
    })
    return response.json()["access_token"]


@pytest.fixture
async def customer_token(client, seeded_db):
    """Get customer access token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "customer@example.com",
        "password": "customer123"
    })
    return response.json()["access_token"]


@pytest.fixture
async def owner_token(client, seeded_db):
    """Get restaurant owner access token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "restaurant@example.com",
        "password": "owner123"
    })
    return response.json()["access_token"]


@pytest.fixture
async def rider_token(client, seeded_db):
    """Get rider access token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "rider@example.com",
        "password": "rider123"
    })
    return response.json()["access_token"]


def auth_header(token: str) -> dict:
    """Create authorization header."""
    return {"Authorization": f"Bearer {token}"}


async def get_restaurant_and_items(client, token):
    """Helper to get restaurant and menu items."""
    restaurants_response = await client.get("/api/v1/restaurants")
    restaurants = restaurants_response.json()["items"]
    if not restaurants:
        return None, None

    restaurant = restaurants[0]
    restaurant_id = restaurant["id"]

    detail_response = await client.get(f"/api/v1/restaurants/{restaurant_id}")
    if detail_response.status_code != 200:
        return None, None

    detail = detail_response.json()
    categories = detail.get("categories", [])

    menu_items = []
    for cat in categories:
        items = cat.get("items", [])
        menu_items.extend(items)

    if not menu_items:
        return None, None

    return restaurant_id, menu_items[0]["id"]


async def get_customer_address(client, token):
    """Helper to get customer's default address."""
    response = await client.get("/api/v1/users/me", headers=auth_header(token))
    if response.status_code != 200:
        return None

    user = response.json()
    addresses = user.get("addresses", [])
    if addresses:
        return addresses[0]["id"]
    return None


async def create_test_order(client, token):
    """Helper to create a test order for payment tests."""
    restaurant_id, menu_item_id = await get_restaurant_and_items(client, token)
    if not restaurant_id or not menu_item_id:
        return None

    address_id = await get_customer_address(client, token)
    if not address_id:
        return None

    response = await client.post("/api/v1/orders", json={
        "restaurant_id": restaurant_id,
        "address_id": address_id,
        "items": [{"menu_item_id": str(menu_item_id), "quantity": 1}],
        "payment_method": "razorpay"
    }, headers=auth_header(token))

    if response.status_code != 200:
        return None

    return response.json()