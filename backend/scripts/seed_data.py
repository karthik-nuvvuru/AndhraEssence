"""Seed database with sample data."""

import asyncio
import sys
import uuid
from datetime import time
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.enums import UserRole
from app.core.security import get_password_hash
from app.database import async_session_factory
from app.models.restaurant import MenuCategory, MenuItem, Restaurant
from app.models.rider import Rider
from app.models.user import Address, User


async def seed_data():
    """Seed database with sample data."""
    async with async_session_factory() as session:
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
        session.add(admin)

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
        session.add(customer)

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
        session.add(address)

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
        session.add(owner)

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
        session.add(restaurant)

        # Create menu categories
        categories_data = [
            ("Starters", "Appetizers and starters"),
            ("Main Course", "Rice and curries"),
            ("Biryani", "Special biryanis"),
            ("Desserts", "Sweet dishes"),
        ]

        for i, (name, desc) in enumerate(categories_data):
            category = MenuCategory(
                id=uuid.uuid4(),
                restaurant_id=restaurant.id,
                name=name,
                description=desc,
                sort_order=i,
            )
            session.add(category)
            await session.flush()

            # Add menu items for each category
            if name == "Starters":
                items = [
                    ("Chicken 65", "Spicy deep-fried chicken", 250, True),
                    ("Paneer Tikka", "Grilled paneer cubes", 220, True),
                    ("Gobi Manchurian", "Crispy cauliflower", 180, True),
                ]
            elif name == "Main Course":
                items = [
                    ("Chicken Curry", "Traditional Andhra chicken curry", 280, False),
                    ("Fish Curry", "Nellore style fish curry", 320, False),
                    ("Dal Fry", "Tempered lentil curry", 150, True),
                    ("Vegetable Curry", "Mixed vegetable curry", 170, True),
                ]
            elif name == "Biryani":
                items = [
                    ("Chicken Biryani", "Aromatic chicken biryani", 350, False),
                    ("Mutton Biryani", "Tender mutton biryani", 450, False),
                    ("Vegetable Biryani", "Flavorful veg biryani", 280, True),
                ]
            else:
                items = [
                    ("Gulab Jamun", "Sweet milk dumplings", 120, True),
                    ("Rasmalai", "Soft cheese in milk", 150, True),
                    ("Ice Cream", "Choice of flavors", 100, True),
                ]

            for j, (item_name, desc, price, is_veg) in enumerate(items):
                menu_item = MenuItem(
                    id=uuid.uuid4(),
                    restaurant_id=restaurant.id,
                    category_id=category.id,
                    name=item_name,
                    description=desc,
                    price=price,
                    is_veg=is_veg,
                    is_available=True,
                    is_featured=(j == 0),
                    preparation_time_minutes=30,
                )
                session.add(menu_item)

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
        session.add(rider_user)

        rider = Rider(
            id=uuid.uuid4(),
            user_id=rider_user.id,
            vehicle_type="bike",
            vehicle_number="TS 01 AB 1234",
            is_available=True,
            is_online=False,
        )
        session.add(rider)

        await session.commit()
        print("Database seeded successfully!")
        print("\nTest Accounts:")
        print("  Admin: admin@andhraessence.com / admin123")
        print("  Customer: customer@example.com / customer123")
        print("  Restaurant Owner: restaurant@example.com / owner123")
        print("  Rider: rider@example.com / rider123")


if __name__ == "__main__":
    asyncio.run(seed_data())
