"""Seed database with sample data - compatible with both PostgreSQL and SQLite.

For demo mode (SQLite), this script imports from demo_models.
For production mode (PostgreSQL), it imports from the regular models.
"""

import asyncio
import sys
import uuid
from datetime import time
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings
from app.database import async_session_factory

settings = get_settings()

# Import from demo_models if in demo mode, otherwise from regular models
if settings.demo_mode:
    from app.demo_models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.demo_models.rider import Rider
    from app.demo_models.user import Address, User
else:
    from app.models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.models.rider import Rider
    from app.models.user import Address, User

from app.core.enums import UserRole
from app.core.security import get_password_hash


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

        # Create restaurant owner 1
        owner1 = User(
            id=uuid.uuid4(),
            email="restaurant@example.com",
            phone="+919999999997",
            password_hash=get_password_hash("owner123"),
            full_name="Restaurant Owner",
            role=UserRole.RESTAURANT_OWNER.value,
            is_verified=True,
        )
        session.add(owner1)

        # Create restaurant 1: Andhra Spice
        restaurant1 = Restaurant(
            id=uuid.uuid4(),
            owner_id=owner1.id,
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
        session.add(restaurant1)

        # Create restaurant owner 2
        owner2 = User(
            id=uuid.uuid4(),
            email="biryani@example.com",
            phone="+919999999996",
            password_hash=get_password_hash("owner123"),
            full_name="Hyderabadi Owner",
            role=UserRole.RESTAURANT_OWNER.value,
            is_verified=True,
        )
        session.add(owner2)

        # Create restaurant 2: Hyderabadi Biryani House
        restaurant2 = Restaurant(
            id=uuid.uuid4(),
            owner_id=owner2.id,
            name="Hyderabadi Biryani House",
            slug="hyderabadi-biryani-house",
            description="Legendary Hyderabadi dum biryani since 1950",
            cuisine_type="Biryani",
            address_line="789 Nizam Road",
            city="Hyderabad",
            state="Telangana",
            postal_code="500001",
            latitude=17.3950,
            longitude=78.4900,
            phone="+919999999991",
            email="info@hydbiryani.com",
            rating=4.7,
            review_count=256,
            is_active=True,
            is_open=True,
            opening_time=time(11, 0),
            closing_time=time(23, 0),
            delivery_radius_km=6.0,
            minimum_order=250,
            delivery_fee=50,
        )
        session.add(restaurant2)

        # Create restaurant owner 3
        owner3 = User(
            id=uuid.uuid4(),
            email="southindian@example.com",
            phone="+919999999995",
            password_hash=get_password_hash("owner123"),
            full_name="South Indian Owner",
            role=UserRole.RESTAURANT_OWNER.value,
            is_verified=True,
        )
        session.add(owner3)

        # Create restaurant 3: South Indian Grand
        restaurant3 = Restaurant(
            id=uuid.uuid4(),
            owner_id=owner3.id,
            name="South Indian Grand",
            slug="south-indian-grand",
            description="Authentic South Indian vegetarian delights",
            cuisine_type="South Indian",
            address_line="321 MG Road",
            city="Hyderabad",
            state="Telangana",
            postal_code="500003",
            latitude=17.3850,
            longitude=78.4700,
            phone="+919999999992",
            email="info@srigrand.com",
            rating=4.3,
            review_count=89,
            is_active=True,
            is_open=True,
            opening_time=time(7, 0),
            closing_time=time(21, 0),
            delivery_radius_km=4.0,
            minimum_order=150,
            delivery_fee=30,
        )
        session.add(restaurant3)

        # Create restaurant owner 4
        owner4 = User(
            id=uuid.uuid4(),
            email="coastal@example.com",
            phone="+919999999994",
            password_hash=get_password_hash("owner123"),
            full_name="Coastal Owner",
            role=UserRole.RESTAURANT_OWNER.value,
            is_verified=True,
        )
        session.add(owner4)

        # Create restaurant 4: Coastal Catch
        restaurant4 = Restaurant(
            id=uuid.uuid4(),
            owner_id=owner4.id,
            name="Coastal Catch",
            slug="coastal-catch",
            description="Fresh seafood from the Arabian coast",
            cuisine_type="Seafood",
            address_line="555 Beach Road",
            city="Hyderabad",
            state="Telangana",
            postal_code="500004",
            latitude=17.3800,
            longitude=78.4600,
            phone="+919999999993",
            email="info@coastalcatch.com",
            rating=4.6,
            review_count=167,
            is_active=True,
            is_open=True,
            opening_time=time(12, 0),
            closing_time=time(22, 30),
            delivery_radius_km=5.0,
            minimum_order=300,
            delivery_fee=60,
        )
        session.add(restaurant4)

        # Create restaurant owner 5
        owner5 = User(
            id=uuid.uuid4(),
            email="veggie@example.com",
            phone="+919999999993",
            password_hash=get_password_hash("owner123"),
            full_name="Veggie Owner",
            role=UserRole.RESTAURANT_OWNER.value,
            is_verified=True,
        )
        session.add(owner5)

        # Create restaurant 5: Veggie Paradise
        restaurant5 = Restaurant(
            id=uuid.uuid4(),
            owner_id=owner5.id,
            name="Veggie Paradise",
            slug="veggie-paradise",
            description="Pure vegetarian paradise with authentic Andhra flavors",
            cuisine_type="Vegetarian",
            address_line="888 Park Lane",
            city="Hyderabad",
            state="Telangana",
            postal_code="500005",
            latitude=17.4000,
            longitude=78.5000,
            phone="+919999999994",
            email="info@veggieparadise.com",
            rating=4.4,
            review_count=203,
            is_active=True,
            is_open=True,
            opening_time=time(8, 0),
            closing_time=time(21, 30),
            delivery_radius_km=5.0,
            minimum_order=180,
            delivery_fee=35,
        )
        session.add(restaurant5)

        # Create menu categories and items for each restaurant
        for restaurant, categories_data in [
            (
                restaurant1,
                [
                    ("Starters", "Appetizers and starters"),
                    ("Main Course", "Rice and curries"),
                    ("Biryani", "Special biryanis"),
                    ("Desserts", "Sweet dishes"),
                ],
            ),
            (
                restaurant2,
                [
                    ("Biryani", "Our signature biryanis"),
                    ("Starters", "Tantalizing starters"),
                    ("Sides", "Perfect accompaniments"),
                    ("Drinks", "Refreshing beverages"),
                ],
            ),
            (
                restaurant3,
                [
                    ("Dosai", "Crispy dosais"),
                    ("Idli", "Soft idlis"),
                    ("Vada", "Crispy vadas"),
                    ("Rice", "Rice dishes"),
                    ("Sweets", "Traditional sweets"),
                ],
            ),
            (
                restaurant4,
                [
                    ("Fish", "Fresh fish preparations"),
                    ("Prawns", "Juicy prawn dishes"),
                    ("Crab", "Crab specialties"),
                    ("Rice", "Seafood rice dishes"),
                ],
            ),
            (
                restaurant5,
                [
                    ("Starters", "Veg starters"),
                    ("Curries", "Rich curries"),
                    ("Rice", "Flavorful rice dishes"),
                    ("Sweets", "Sweet endings"),
                ],
            ),
        ]:
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
            if name in ["Starters", "Veg starters"]:
                items = [
                    ("Paneer Tikka", "Grilled paneer cubes", 220, True),
                    ("Gobi Manchurian", "Crispy cauliflower", 180, True),
                    ("Hara Bhara Kebab", "Spinach and pea kebab", 200, True),
                ]
            elif name in ["Main Course", "Curries"]:
                items = [
                    ("Dal Tadka", "Tempered lentil curry", 150, True),
                    ("Vegetable Curry", "Mixed vegetable curry", 170, True),
                    ("Malai Kofta", "Creamy paneer dumplings", 250, True),
                    ("Mix Veg", "Seasonal vegetables", 180, True),
                ]
            elif name in ["Biryani", "Rice"]:
                items = [
                    ("Veg Biryani", "Aromatic veg biryani", 280, True),
                    ("Paneer Biryani", "Fragrant paneer biryani", 320, True),
                    ("Jeera Rice", "Cumin flavored rice", 150, True),
                    ("Steamed Rice", "Perfect fluffy rice", 100, True),
                ]
            elif name in ["Desserts", "Sweets"]:
                items = [
                    ("Gulab Jamun", "Sweet milk dumplings", 120, True),
                    ("Rasmalai", "Soft cheese in milk", 150, True),
                    ("Ice Cream", "Choice of flavors", 100, True),
                    ("Kheer", "Rice pudding", 130, True),
                ]
            elif name in ["Dosai"]:
                items = [
                    ("Masala Dosai", "Dosai with spiced potatoes", 180, True),
                    ("Plain Dosai", "Crispy plain dosai", 120, True),
                    ("Set Dosai", "Soft pancakes with chutneys", 160, True),
                ]
            elif name in ["Idli"]:
                items = [
                    ("Idli Sambar", "Soft idlis with sambar", 120, True),
                    ("Rava Idli", "Semolina idli", 140, True),
                ]
            elif name in ["Vada"]:
                items = [
                    ("Medu Vada", "Crispy lentil fritters", 100, True),
                    ("Masala Vada", "Spiced vada", 110, True),
                ]
            elif name in ["Fish"]:
                items = [
                    ("Fish Curry", "Traditional fish curry", 350, False),
                    ("Prawn Fry", "Spiced prawn fry", 380, False),
                    ("Fish Fry", "Crispy fish fry", 320, False),
                ]
            elif name in ["Prawns"]:
                items = [
                    ("Prawn Curry", "Spicy prawn curry", 400, False),
                    ("Garlic Prawns", "Garlic butter prawns", 420, False),
                ]
            elif name in ["Crab"]:
                items = [
                    ("Crab Fry", "Spicy crab fry", 450, False),
                    ("Crab Curry", "Rich crab curry", 480, False),
                ]
            elif name in ["Sides"]:
                items = [
                    ("Raita", "Yogurt with spices", 80, True),
                    ("Mirchi Ka Salan", "Green chili curry", 100, True),
                    ("Bagara Khana", "Fragrant rice", 120, True),
                ]
            elif name in ["Drinks"]:
                items = [
                    ("Lassi", "Sweet yogurt drink", 80, True),
                    ("Masala Chaas", "Spiced buttermilk", 60, True),
                    ("Nimbu Pani", "Refreshing lemonade", 50, True),
                ]
            else:
                items = [
                    ("Special Curry", "Chef's special", 200, True),
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
        print(
            f"Database type: {'SQLite (demo mode)' if settings.demo_mode else 'PostgreSQL'}"
        )
        print("\nTest Accounts:")
        print("  Admin: admin@andhraessence.com / admin123")
        print("  Customer: customer@example.com / customer123")
        print("  Restaurant Owner: restaurant@example.com / owner123")
        print("  Rider: rider@example.com / rider123")


if __name__ == "__main__":
    asyncio.run(seed_data())
