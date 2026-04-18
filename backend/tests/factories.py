import uuid
import random
from datetime import datetime, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import get_settings
from app.core.security import get_password_hash
from app.core.enums import UserRole, OrderStatus, PaymentMethod, PaymentStatus

settings = get_settings()

# Use demo_models when in demo mode, otherwise regular models
if settings.demo_mode:
    from app.demo_models.user import User, Address
    from app.demo_models.restaurant import Restaurant, MenuCategory, MenuItem
    from app.demo_models.order import Order, OrderItem
else:
    from app.models.user import User, Address
    from app.models.restaurant import Restaurant, MenuCategory, MenuItem
    from app.models.order import Order, OrderItem


async def create_user(
    db: AsyncSession,
    email: str = None,
    password: str = "testpass123",
    phone: str = None,
    full_name: str = "Test User",
    role: UserRole = UserRole.CUSTOMER,
) -> User:
    """Factory function to create a user."""
    user = User(
        id=uuid.uuid4(),
        email=email or f"user_{uuid.uuid4().hex[:8]}@example.com",
        phone=phone or f"+1{random.randint(1000000000, 9999999999)}",
        password_hash=get_password_hash(password),
        full_name=full_name,
        role=role,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def create_restaurant(
    db: AsyncSession,
    owner_id: uuid.UUID = None,
    name: str = None,
    slug: str = None,
    city: str = "Test City",
    state: str = "Test State",
    cuisine_type: str = "Indian",
    latitude: float = 17.3850,
    longitude: float = 78.4867,
) -> Restaurant:
    """Factory function to create a restaurant."""
    owner = None
    if owner_id:
        result = await db.execute(select(User).where(User.id == owner_id))
        owner = result.scalar_one_or_none()

    if not owner:
        owner = await create_user(db, role=UserRole.RESTAURANT_OWNER)

    restaurant = Restaurant(
        id=uuid.uuid4(),
        owner_id=owner.id,
        name=name or f"Restaurant {uuid.uuid4().hex[:8]}",
        slug=slug or f"restaurant-{uuid.uuid4().hex[:8]}",
        description="A test restaurant",
        cuisine_type=cuisine_type,
        address_line="123 Test Street",
        city=city,
        state=state,
        postal_code="500001",
        latitude=latitude,
        longitude=longitude,
        phone="+1234567890",
        email="restaurant@example.com",
        is_active=True,
        is_open=True,
        opening_time=time(9, 0),
        closing_time=time(22, 0),
        delivery_radius_km=5.0,
        minimum_order=0.0,
        delivery_fee=50.0,
    )
    db.add(restaurant)
    await db.commit()
    await db.refresh(restaurant)
    return restaurant


async def create_order(
    db: AsyncSession,
    customer_id: uuid.UUID = None,
    restaurant_id: uuid.UUID = None,
    address_id: uuid.UUID = None,
    subtotal: float = 100.0,
    total_amount: float = 150.0,
    status: OrderStatus = OrderStatus.PENDING,
    payment_method: PaymentMethod = PaymentMethod.RAZORPAY,
    payment_status: PaymentStatus = PaymentStatus.PENDING,
) -> Order:
    """Factory function to create an order."""
    if not customer_id:
        customer = await create_user(db)
        customer_id = customer.id

    if not restaurant_id:
        restaurant = await create_restaurant(db)
        restaurant_id = restaurant.id

    if not address_id:
        user_result = await db.execute(select(User).where(User.id == customer_id))
        user = user_result.scalar_one_or_none()
        address = Address(
            id=uuid.uuid4(),
            user_id=user.id if user else customer_id,
            label="Home",
            address_line="456 Test Avenue",
            city="Test City",
            state="Test State",
            postal_code="500002",
            country="India",
            latitude=17.3850,
            longitude=78.4867,
            is_default=True,
        )
        db.add(address)
        await db.commit()
        await db.refresh(address)
        address_id = address.id

    order_number = f"ORD{uuid.uuid4().hex[:8].upper()}"

    order = Order(
        id=uuid.uuid4(),
        order_number=order_number,
        customer_id=customer_id,
        restaurant_id=restaurant_id,
        address_id=address_id,
        subtotal=subtotal,
        tax_amount=subtotal * 0.05,
        delivery_fee=50.0,
        total_amount=total_amount,
        status=status,
        payment_method=payment_method,
        payment_status=payment_status,
        placed_at=datetime.utcnow(),
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order
