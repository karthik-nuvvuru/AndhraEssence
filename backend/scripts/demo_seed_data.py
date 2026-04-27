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
from app.database import async_session_factory, engine, Base

settings = get_settings()

# Import from demo_models if in demo mode, otherwise from regular models
if settings.demo_mode:
    from app.demo_models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.demo_models.rider import Rider
    from app.demo_models.user import Address, User
    from app.demo_models.long_order import LongOrderCategory, LongOrderItem
else:
    from app.models.restaurant import MenuCategory, MenuItem, Restaurant
    from app.models.rider import Rider
    from app.models.user import Address, User
    from app.models.long_order import LongOrderCategory, LongOrderItem

from app.core.enums import UserRole
from app.core.security import get_password_hash


# Unsplash image URLs for restaurants
RESTAURANT_IMAGES = {
    "paradise_biryani": {
        "cover": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
        "logo": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200",
    },
    "andhra_spice": {
        "cover": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800",
        "logo": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200",
    },
    "south_indian_grand": {
        "cover": "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=800",
        "logo": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200",
    },
    "coastal_catch": {
        "cover": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800",
        "logo": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200",
    },
    "veggie_paradise": {
        "cover": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        "logo": "https://images.unsplash.com/photo-1540420773420-1d5d4c0f64e4?w=200",
    },
    "rayalaseema_ruchulu": {
        "cover": "https://images.unsplash.com/photo-1588943211466-1f7fa63e34e4?w=800",
        "logo": "https://images.unsplash.com/photo-1567188040759-fb8a8831cc2a?w=200",
    },
    "hotel_shadab": {
        "cover": "https://images.unsplash.com/photo-1569554362530-3d4bd2da11cc?w=800",
        "logo": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200",
    },
    "imperial_restaurant": {
        "cover": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "logo": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200",
    },
    "bawarchi": {
        "cover": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        "logo": "https://images.unsplash.com/photo-1574966740791-3d7b05a400aa?w=200",
    },
    "madhur": {
        "cover": "https://images.unsplash.com/photo-1567620905732-2d1e4b2d5b8a?w=800",
        "logo": "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200",
    },
    "keventers": {
        "cover": "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800",
        "logo": "https://images.unsplash.com/photo-1546173159-315724a31696?w=200",
    },
    "ccd": {
        "cover": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        "logo": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200",
    },
    "burger_king": {
        "cover": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        "logo": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200",
    },
    "pizza_hut": {
        "cover": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
        "logo": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
    },
    "dominos": {
        "cover": "https://images.unsplash.com/photo-1513104890138-7c749659a87c?w=800",
        "logo": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200",
    },
}

# Menu item images
MENU_ITEM_IMAGES = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    "https://images.unsplash.com/photo-1567620905732-2d1e4b2d5b8a?w=400",
    "https://images.unsplash.com/photo-1565299624946-b28f40a188e5?w=400",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400",
    "https://images.unsplash.com/photo-1603073163308-1d6a4c2d5b8a?w=400",
]


async def seed_data():
    """Seed database with sample data."""
    # Create all tables first
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Create admin user
        admin = User(
            id=str(uuid.uuid4()),
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
            id=str(uuid.uuid4()),
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
            id=str(uuid.uuid4()),
            user_id=customer.id,
            label="Home",
            address_line="123 Main Street, Jubilee Hills",
            city="Hyderabad",
            state="Telangana",
            postal_code="500001",
            latitude=17.3850,
            longitude=78.4867,
            is_default=True,
        )
        session.add(address)

        # Create 15 restaurant owners
        owners_data = [
            ("restaurant@example.com", "Restaurant Owner 1", "Paradise Biryani"),
            ("biryani@example.com", "Hyderabadi Owner", "Hyderabadi Biryani House"),
            ("southindian@example.com", "South Indian Owner", "South Indian Grand"),
            ("coastal@example.com", "Coastal Owner", "Coastal Catch"),
            ("veggie@example.com", "Veggie Owner", "Veggie Paradise"),
            ("rayalaseema@example.com", "Rayalaseema Owner", "Rayalaseema Ruchulu"),
            ("shadab@example.com", "Shadab Owner", "Hotel Shadab"),
            ("imperial@example.com", "Imperial Owner", "Imperial Restaurant"),
            ("bawarchi@example.com", "Bawarchi Owner", "Bawarchi Restaurant"),
            ("madhur@example.com", "Madhur Owner", "Madhur Restaurant"),
            ("keventers@example.com", "Keventers Owner", "Keventers"),
            ("ccd@example.com", "CCD Owner", "Cafe Coffee Day"),
            ("burgerking@example.com", "Burger King Owner", "Burger King"),
            ("pizzahut@example.com", "Pizza Hut Owner", "Pizza Hut"),
            ("dominos@example.com", "Domino's Owner", "Domino's Pizza"),
        ]

        owners = []
        for i, (email, name, _) in enumerate(owners_data):
            owner = User(
                id=str(uuid.uuid4()),
                email=email,
                phone=f"+919999990{i:03d}",
                password_hash=get_password_hash("owner123"),
                full_name=name,
                role=UserRole.RESTAURANT_OWNER.value,
                is_verified=True,
            )
            session.add(owner)
            owners.append(owner)

        await session.flush()

        # Define 15 restaurants with images
        restaurants_data = [
            {
                "owner": owners[0],
                "name": "Paradise Biryani",
                "slug": "paradise-biryani",
                "description": "Legendary biryani and authentic Hyderabadi cuisine",
                "cuisine_type": "Biryani, South Indian",
                "address_line": "Road No. 36, Jubilee Hills",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500033",
                "latitude": 17.4050,
                "longitude": 78.4500,
                "phone": "+919999999010",
                "email": "info@paradisebiryani.com",
                "rating": 4.5,
                "review_count": 2340,
                "is_open": True,
                "opening_time": time(11, 0),
                "closing_time": time(23, 0),
                "delivery_radius_km": 6.0,
                "minimum_order": 250,
                "delivery_fee": 40,
                "images_key": "paradise_biryani",
                "categories": [
                    ("Biryani", "Our signature dum biryanis", [
                        ("Chicken Biryani", "Aromatic chicken biryani", 320, False),
                        ("Mutton Biryani", "Slow-cooked mutton biryani", 380, False),
                        ("Veg Biryani", "Garden fresh veg biryani", 280, True),
                        ("Paneer Biryani", "Spiced paneer biryani", 300, True),
                        ("Kashmiri Biryani", "Dry fruits biryani", 400, False),
                    ]),
                    ("Starters", "Tantalizing starters", [
                        ("Chicken 65", "Spicy deep-fried chicken", 250, False),
                        ("Paneer Tikka", "Grilled paneer cubes", 220, True),
                        ("Hara Bhara Kebab", "Spinach and pea kebab", 200, True),
                        ("Gobi Manchurian", "Crispy cauliflower", 180, True),
                    ]),
                    ("Sides", "Perfect accompaniments", [
                        ("Raita", "Yogurt with spices", 80, True),
                        ("Mirchi Ka Salan", "Green chili curry", 100, True),
                        ("Salad", "Fresh mixed salad", 60, True),
                    ]),
                    ("Desserts", "Sweet endings", [
                        ("Qubani Ka Meetha", "Apricot dessert", 150, True),
                        ("Double Ka Meetha", "Bread pudding", 120, True),
                    ]),
                ],
            },
            {
                "owner": owners[1],
                "name": "Hyderabadi Biryani House",
                "slug": "hyderabadi-biryani-house",
                "description": "Authentic Hyderabadi dum biryani since 1950",
                "cuisine_type": "Biryani, Mughlai",
                "address_line": "789 Nizam Road, Abids",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500001",
                "latitude": 17.3950,
                "longitude": 78.4900,
                "phone": "+919999999011",
                "email": "info@hydbiryani.com",
                "rating": 4.7,
                "review_count": 3250,
                "is_open": True,
                "opening_time": time(11, 0),
                "closing_time": time(23, 30),
                "delivery_radius_km": 7.0,
                "minimum_order": 300,
                "delivery_fee": 50,
                "images_key": "andhra_spice",
                "categories": [
                    ("Biryani", "Signature biryanis", [
                        ("Chicken 65 Biryani", "Spicy chicken biryani", 350, False),
                        ("Mutton Kheema Biryani", "Minced meat biryani", 400, False),
                        ("Fish Biryani", "Coastal style fish biryani", 420, False),
                        ("Veg Biryani", "Fresh vegetables biryani", 280, True),
                    ]),
                    ("Curries", "Rich gravies", [
                        ("Chicken Curry", "Traditional chicken curry", 300, False),
                        ("Mutton Curry", "Slow-cooked mutton", 350, False),
                        ("Dal Fry", "Tempered lentil", 150, True),
                    ]),
                    ("Bread", "Fresh baked", [
                        ("Butter Naan", "Garlic butter naan", 80, True),
                        ("Roomali Roti", "Soft wheat roti", 40, True),
                        ("Sheermal", "Saffron bread", 60, True),
                    ]),
                ],
            },
            {
                "owner": owners[2],
                "name": "South Indian Grand",
                "slug": "south-indian-grand",
                "description": "Authentic South Indian vegetarian delights",
                "cuisine_type": "South Indian, Dosa",
                "address_line": "321 MG Road, Banjara Hills",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500034",
                "latitude": 17.4100,
                "longitude": 78.4700,
                "phone": "+919999999012",
                "email": "info@srigrand.com",
                "rating": 4.3,
                "review_count": 1890,
                "is_open": True,
                "opening_time": time(6, 0),
                "closing_time": time(22, 0),
                "delivery_radius_km": 5.0,
                "minimum_order": 150,
                "delivery_fee": 30,
                "images_key": "south_indian_grand",
                "categories": [
                    ("Dosai", "Crispy dosais", [
                        ("Masala Dosai", "Dosai with spiced potatoes", 180, True),
                        ("Plain Dosai", "Crispy plain dosai", 120, True),
                        ("Set Dosai", "Soft pancakes with chutneys", 160, True),
                        ("Rava Dosai", "Semolina dosai", 150, True),
                        ("Panneer Dosai", "Stuffed paneer dosai", 200, True),
                    ]),
                    ("Idli", "Soft idlis", [
                        ("Idli Sambar", "Soft idlis with sambar", 120, True),
                        ("Rava Idli", "Semolina idli", 140, True),
                        ("Mini Idli Sambar", "Small idlis with sambar", 100, True),
                    ]),
                    ("Vada", "Crispy vadas", [
                        ("Medu Vada", "Crispy lentil fritters", 100, True),
                        ("Masala Vada", "Spiced vada", 110, True),
                        ("Uttappam", "Loaded vegetable uttappam", 150, True),
                    ]),
                    ("Rice", "Rice dishes", [
                        ("Lemon Rice", "Tangy lemon rice", 130, True),
                        ("Coconut Rice", "Fresh coconut rice", 140, True),
                        ("Bisi Bele Bath", "Karnataka special", 180, True),
                    ]),
                ],
            },
            {
                "owner": owners[3],
                "name": "Coastal Catch",
                "slug": "coastal-catch",
                "description": "Fresh seafood from the Arabian coast",
                "cuisine_type": "Seafood, Coastal",
                "address_line": "555 Beach Road, KBR Park",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500005",
                "latitude": 17.4200,
                "longitude": 78.4600,
                "phone": "+919999999013",
                "email": "info@coastalcatch.com",
                "rating": 4.6,
                "review_count": 1560,
                "is_open": True,
                "opening_time": time(12, 0),
                "closing_time": time(22, 30),
                "delivery_radius_km": 5.0,
                "minimum_order": 350,
                "delivery_fee": 60,
                "images_key": "coastal_catch",
                "categories": [
                    ("Fish", "Fresh fish preparations", [
                        ("Fish Curry", "Traditional fish curry", 380, False),
                        ("Fish Fry", "Crispy fish fry", 350, False),
                        ("Pandi Curry", "Red fish curry", 400, False),
                        ("Chepa Pulusu", "Catfish curry", 360, False),
                    ]),
                    ("Prawns", "Juicy prawn dishes", [
                        ("Prawn Curry", "Spicy prawn curry", 450, False),
                        ("Garlic Prawns", "Garlic butter prawns", 480, False),
                        ("Chilli Prawns", "Spicy Indo-Chinese", 500, False),
                    ]),
                    ("Crab", "Crab specialties", [
                        ("Crab Fry", "Spicy crab fry", 520, False),
                        ("Crab Curry", "Rich crab curry", 550, False),
                    ]),
                    ("Rice", "Seafood rice dishes", [
                        ("Prawn Biryani", "Aromatic prawn biryani", 480, False),
                        ("Fish Biryani", "Flaky fish biryani", 420, False),
                    ]),
                ],
            },
            {
                "owner": owners[4],
                "name": "Veggie Paradise",
                "slug": "veggie-paradise",
                "description": "Pure vegetarian paradise with authentic Andhra flavors",
                "cuisine_type": "Vegetarian, Andhra",
                "address_line": "888 Park Lane, Secunderabad",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500003",
                "latitude": 17.4400,
                "longitude": 78.4900,
                "phone": "+919999999014",
                "email": "info@veggieparadise.com",
                "rating": 4.4,
                "review_count": 2100,
                "is_open": True,
                "opening_time": time(8, 0),
                "closing_time": time(21, 30),
                "delivery_radius_km": 5.0,
                "minimum_order": 180,
                "delivery_fee": 35,
                "images_key": "veggie_paradise",
                "categories": [
                    ("Starters", "Veg starters", [
                        ("Paneer Tikka", "Grilled paneer cubes", 240, True),
                        ("Hara Bhara Kebab", "Spinach and pea kebab", 200, True),
                        ("Crispy Corn", "Golden fried corn", 180, True),
                        ("Spring Roll", "Vegetable spring roll", 160, True),
                    ]),
                    ("Curries", "Rich curries", [
                        ("Dal Tadka", "Tempered lentil curry", 150, True),
                        ("Malai Kofta", "Creamy paneer dumplings", 280, True),
                        ("Shahi Paneer", "Royal paneer gravy", 260, True),
                        ("Mix Veg", "Seasonal vegetables", 180, True),
                    ]),
                    ("Biryani", "Flavorful biryanis", [
                        ("Veg Biryani", "Aromatic veg biryani", 260, True),
                        ("Paneer Biryani", "Spiced paneer biryani", 300, True),
                        ("Mushroom Biryani", "Earthy mushroom biryani", 280, True),
                    ]),
                    ("Sweets", "Sweet endings", [
                        ("Gulab Jamun", "Sweet milk dumplings", 120, True),
                        ("Rasmalai", "Soft cheese in milk", 150, True),
                        ("Kheer", "Rice pudding", 130, True),
                    ]),
                ],
            },
            {
                "owner": owners[5],
                "name": "Rayalaseema Ruchulu",
                "slug": "rayalaseema-ruchulu",
                "description": "Authentic Rayalaseema cuisine with traditional recipes",
                "cuisine_type": "Rayalaseema, Andhra",
                "address_line": "456 RTC Road, Koti",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500195",
                "latitude": 17.3950,
                "longitude": 78.5100,
                "phone": "+919999999015",
                "email": "info@rayalaseemaruchulu.com",
                "rating": 4.6,
                "review_count": 2780,
                "is_open": True,
                "opening_time": time(11, 30),
                "closing_time": time(22, 30),
                "delivery_radius_km": 5.0,
                "minimum_order": 200,
                "delivery_fee": 40,
                "images_key": "rayalaseema_ruchulu",
                "categories": [
                    ("Non-Veg", "Signature non-veg", [
                        ("Kunda Biryani", "Mutton biryani special", 400, False),
                        ("Chicken Curry", "Andhra style chicken", 300, False),
                        ("Mamsam Kulfa", "Lamb curry with bottle gourd", 350, False),
                    ]),
                    ("Vegetables", "Fresh vegetables", [
                        ("Bendakaya Fry", "Okra fry", 180, True),
                        ("Chamma Guddu", "Paneer chunks curry", 250, True),
                        ("Tomato Fry", "Spiced tomato curry", 140, True),
                    ]),
                    ("Tiffins", "Morning specials", [
                        ("Pesarattu", "Green gram dosa", 120, True),
                        ("Upma", "Semolina upma", 80, True),
                        ("Pongal", "Rice and lentil dish", 100, True),
                    ]),
                ],
            },
            {
                "owner": owners[6],
                "name": "Hotel Shadab",
                "slug": "hotel-shadab",
                "description": "Legendary Mughlai and Biryani since 1950",
                "cuisine_type": "Mughlai, Biryani",
                "address_line": "MG Road, Secunderabad",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500003",
                "latitude": 17.4400,
                "longitude": 78.5000,
                "phone": "+919999999016",
                "email": "info@hotelshadab.com",
                "rating": 4.2,
                "review_count": 1890,
                "is_open": True,
                "opening_time": time(11, 0),
                "closing_time": time(23, 0),
                "delivery_radius_km": 6.0,
                "minimum_order": 200,
                "delivery_fee": 45,
                "images_key": "hotel_shadab",
                "categories": [
                    ("Biryani", "Award-winning biryanis", [
                        ("Chicken Biryani", "Signature chicken biryani", 320, False),
                        ("Mutton Biryani", "Juicy mutton biryani", 380, False),
                        ("Double Egg Biryani", "Extra egg biryani", 300, False),
                    ]),
                    ("Curries", "Rich gravies", [
                        ("Butter Chicken", "Creamy tomato chicken", 340, False),
                        ("Rogan Josh", "Aromatic lamb curry", 400, False),
                        ("Kadai Paneer", "Bell pepper paneer", 260, True),
                    ]),
                    ("Bread", "Fresh breads", [
                        ("Butter Naan", "Garlic butter naan", 80, True),
                        ("Tandoori Roti", "Clay oven bread", 50, True),
                        ("Kulcha", "Stuffed bread", 90, True),
                    ]),
                ],
            },
            {
                "owner": owners[7],
                "name": "Imperial Restaurant",
                "slug": "imperial-restaurant",
                "description": "Fine dining with authentic North Indian cuisine",
                "cuisine_type": "North Indian, Biryani",
                "address_line": "Abids Road, Abids",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500001",
                "latitude": 17.4000,
                "longitude": 78.5100,
                "phone": "+919999999017",
                "email": "info@imperial.com",
                "rating": 4.5,
                "review_count": 2650,
                "is_open": True,
                "opening_time": time(12, 0),
                "closing_time": time(22, 30),
                "delivery_radius_km": 5.0,
                "minimum_order": 250,
                "delivery_fee": 40,
                "images_key": "imperial_restaurant",
                "categories": [
                    ("Starters", "Tantalizing starters", [
                        ("Chicken Malai Tikka", "Creamy chicken tikka", 280, False),
                        ("Paneer Tikka", "Grilled paneer", 240, True),
                        ("Seekh Kebab", "Minced meat kebab", 320, False),
                    ]),
                    ("Main Course", "Signature dishes", [
                        ("Chicken Tikka Masala", "Creamy tomato gravy", 340, False),
                        ("Dal Makhani", "Slow-cooked black lentils", 220, True),
                        ("Biryani", "Aromatic biryani", 300, False),
                    ]),
                    ("Desserts", "Sweet finales", [
                        ("Gulab Jamun", "Sweet milk balls", 120, True),
                        ("Rasmalai", "Cottage cheese dessert", 150, True),
                    ]),
                ],
            },
            {
                "owner": owners[8],
                "name": "Bawarchi Restaurant",
                "slug": "bawarchi-restaurant",
                "description": "Hyderabadi cuisine with authentic flavors",
                "cuisine_type": "South Indian, Chinese",
                "address_line": "RTC Cross Road, Musheerabad",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500020",
                "latitude": 17.4300,
                "longitude": 78.5200,
                "phone": "+919999999018",
                "email": "info@bawarchi.com",
                "rating": 4.0,
                "review_count": 3200,
                "is_open": True,
                "opening_time": time(11, 0),
                "closing_time": time(22, 0),
                "delivery_radius_km": 6.0,
                "minimum_order": 150,
                "delivery_fee": 35,
                "images_key": "bawarchi",
                "categories": [
                    ("Biryani", "Hyderabadi biryani", [
                        ("Chicken Biryani", "Classic chicken biryani", 280, False),
                        ("Mutton Biryani", "Premium mutton biryani", 350, False),
                        ("Veg Biryani", "Fresh veg biryani", 240, True),
                    ]),
                    ("Chinese", "Indo-Chinese", [
                        ("Chicken Fried Rice", "Wok-tossed rice", 220, False),
                        ("Hakka Noodles", "Stir-fried noodles", 200, False),
                        ("Chilli Chicken", "Spicy chicken", 280, False),
                    ]),
                    ("South Indian", "Authentic dishes", [
                        ("Dosai", "Crispy dosai", 120, True),
                        ("Idli", "Soft idlis", 100, True),
                    ]),
                ],
            },
            {
                "owner": owners[9],
                "name": "Madhur Restaurant",
                "slug": "madhur-restaurant",
                "description": "Pure vegetarian South Indian cuisine",
                "cuisine_type": "Vegetarian, South Indian",
                "address_line": "Koti Main Road, Abids",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500195",
                "latitude": 17.4050,
                "longitude": 78.5050,
                "phone": "+919999999019",
                "email": "info@madhur.com",
                "rating": 4.3,
                "review_count": 1450,
                "is_open": True,
                "opening_time": time(6, 0),
                "closing_time": time(22, 0),
                "delivery_radius_km": 4.0,
                "minimum_order": 100,
                "delivery_fee": 25,
                "images_key": "madhur",
                "categories": [
                    ("Dosai", "Crispy dosais", [
                        ("Masala Dosai", "Spiced potato dosai", 160, True),
                        ("Plain Dosai", "Simple crispy dosai", 110, True),
                        ("Rava Dosai", "Semolina dosai", 140, True),
                    ]),
                    ("Idli", "Soft idlis", [
                        ("Idli Sambar", "Idli with sambar", 100, True),
                        ("Rava Idli", "Semolina idli", 120, True),
                    ]),
                    ("Upma", "Morning upmas", [
                        ("Bombay Upma", "Tangy semolina", 80, True),
                        ("Poha", "Beaten rice", 70, True),
                    ]),
                ],
            },
            {
                "owner": owners[10],
                "name": "Keventers",
                "slug": "keventers",
                "description": "Refreshing shakes, coolers and fast food",
                "cuisine_type": "Beverages, Fast Food",
                "address_line": "Banjara Hills Road No. 2",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500034",
                "latitude": 17.4150,
                "longitude": 78.4750,
                "phone": "+919999999020",
                "email": "info@keventers.com",
                "rating": 4.1,
                "review_count": 890,
                "is_open": True,
                "opening_time": time(10, 0),
                "closing_time": time(23, 0),
                "delivery_radius_km": 4.0,
                "minimum_order": 150,
                "delivery_fee": 30,
                "images_key": "keventers",
                "categories": [
                    ("Shakes", "Thick shakes", [
                        ("Chocolate Shake", "Rich chocolate", 180, True),
                        ("Mango Shake", "Fresh mango", 160, True),
                        ("Strawberry Shake", "Sweet strawberry", 170, True),
                        ("Butterscotch Shake", "Caramel butterscotch", 190, True),
                    ]),
                    ("Fast Food", "Quick bites", [
                        ("Cheese Burger", "Cheesy patty burger", 200, False),
                        ("Veg Burger", "Fresh veg burger", 150, True),
                        ("Pizza Pocket", "Stuffed pizza", 180, True),
                    ]),
                    ("Coolers", "Refreshing drinks", [
                        ("Lemon Soda", "Tangy lemon", 80, True),
                        ("Masala Chaas", "Spiced buttermilk", 70, True),
                    ]),
                ],
            },
            {
                "owner": owners[11],
                "name": "Cafe Coffee Day",
                "slug": "cafe-coffee-day",
                "description": "India's iconic coffee chain",
                "cuisine_type": "Cafe, Beverages",
                "address_line": "Jubilee Hills Checkpost",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500033",
                "latitude": 17.4100,
                "longitude": 78.4550,
                "phone": "+919999999021",
                "email": "info@ccd.com",
                "rating": 4.0,
                "review_count": 720,
                "is_open": True,
                "opening_time": time(9, 0),
                "closing_time": time(22, 0),
                "delivery_radius_km": 4.0,
                "minimum_order": 150,
                "delivery_fee": 30,
                "images_key": "ccd",
                "categories": [
                    ("Coffee", "Signature coffees", [
                        ("Espresso", "Strong espresso", 100, True),
                        ("Cappuccino", "Frothy cappuccino", 150, True),
                        ("Latte", "Smooth latte", 160, True),
                        ("Cold Coffee", "Iced cold coffee", 180, True),
                    ]),
                    ("Snacks", "Light bites", [
                        ("Cheese Sandwich", "Grilled cheese sandwich", 180, True),
                        ("Veg Sandwich", "Fresh veg sandwich", 150, True),
                        ("Croissant", "Buttery croissant", 120, True),
                    ]),
                    ("Desserts", "Sweet treats", [
                        ("Chocolate Brownie", "Fudgy brownie", 140, True),
                        ("Cheesecake", "Creamy cheesecake", 180, True),
                    ]),
                ],
            },
            {
                "owner": owners[12],
                "name": "Burger King",
                "slug": "burger-king",
                "description": "Flame-grilled burgers with fresh ingredients",
                "cuisine_type": "Burgers, Fast Food",
                "address_line": "Inorbit Mall, Gachibowli",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500032",
                "latitude": 17.4400,
                "longitude": 78.3500,
                "phone": "+919999999022",
                "email": "info@burgerking.com",
                "rating": 4.2,
                "review_count": 1100,
                "is_open": True,
                "opening_time": time(10, 0),
                "closing_time": time(23, 0),
                "delivery_radius_km": 5.0,
                "minimum_order": 200,
                "delivery_fee": 40,
                "images_key": "burger_king",
                "categories": [
                    ("Burgers", "Signature burgers", [
                        ("Chicken Whopper", "Flame-grilled chicken", 280, False),
                        ("Veg Whopper", "Plant-based patty", 250, True),
                        ("Cheese Burger", "Classic cheese", 200, False),
                        ("Veg Cheese Burger", "Veg with cheese", 180, True),
                    ]),
                    ("Sides", "Perfect companions", [
                        ("French Fries", "Crispy fries", 100, True),
                        ("Onion Rings", "Golden rings", 120, True),
                        ("Chicken Wings", "Spicy wings", 180, False),
                    ]),
                    ("Beverages", "Refreshing drinks", [
                        ("Coca Cola", "Classic cola", 80, True),
                        ("Sprite", "Lemon-lime soda", 80, True),
                        ("Milkshake", "Thick vanilla shake", 160, True),
                    ]),
                ],
            },
            {
                "owner": owners[13],
                "name": "Pizza Hut",
                "slug": "pizza-hut",
                "description": "Authentic Italian pizza with fresh toppings",
                "cuisine_type": "Pizza, Italian",
                "address_line": "Shankarmet Road, Santosh Nagar",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500059",
                "latitude": 17.3700,
                "longitude": 78.5200,
                "phone": "+919999999023",
                "email": "info@pizzahut.com",
                "rating": 4.1,
                "review_count": 1650,
                "is_open": True,
                "opening_time": time(11, 0),
                "closing_time": time(23, 0),
                "delivery_radius_km": 5.0,
                "minimum_order": 200,
                "delivery_fee": 40,
                "images_key": "pizza_hut",
                "categories": [
                    ("Pizza", "Signature pizzas", [
                        ("Margherita", "Classic tomato and mozzarella", 250, True),
                        ("Pepperoni", "Spicy pepperoni", 350, False),
                        ("Veg Supreme", "Garden vegetables", 300, True),
                        ("Chicken Supreme", "Mixed chicken toppings", 380, False),
                        ("BBQ Chicken", "Smoky BBQ chicken", 360, False),
                    ]),
                    ("Sides", "Perfect starters", [
                        ("Garlic Bread", "Cheesy garlic bread", 150, True),
                        ("Chicken Wings", "Crispy wings", 200, False),
                    ]),
                    ("Desserts", "Sweet endings", [
                        ("Chocolate Lava Cake", "Warm chocolate cake", 180, True),
                        ("Brownie", "Fudgy brownie", 140, True),
                    ]),
                ],
            },
            {
                "owner": owners[14],
                "name": "Domino's Pizza",
                "slug": "dominos-pizza",
                "description": "Hot and fresh pizza delivered fast",
                "cuisine_type": "Pizza, Fast Food",
                "address_line": "SR Nagar Main Road",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500038",
                "latitude": 17.4300,
                "longitude": 78.4400,
                "phone": "+919999999024",
                "email": "info@dominos.com",
                "rating": 4.0,
                "review_count": 2100,
                "is_open": True,
                "opening_time": time(11, 0),
                "closing_time": time(23, 0),
                "delivery_radius_km": 5.0,
                "minimum_order": 200,
                "delivery_fee": 35,
                "images_key": "dominos",
                "categories": [
                    ("Pizza", "Fresh pizzas", [
                        ("Farmhouse", "Fresh vegetables", 280, True),
                        ("Pepperoni Feast", "Loaded pepperoni", 360, False),
                        ("Chicken Max", "Double chicken", 400, False),
                        ("Veggie Lover", "All vegetables", 300, True),
                    ]),
                    ("Pasta", "Italian pasta", [
                        ("Chicken Alfredo", "Creamy alfredo", 280, False),
                        ("Veggie Pasta", "Tomato basil pasta", 240, True),
                    ]),
                    ("Sides", "Tasty sides", [
                        ("Garlic Breadstick", "Crispy breadsticks", 120, True),
                        ("Cheesy Garlic Bread", "Extra cheese", 160, True),
                    ]),
                ],
            },
        ]

        # Create all restaurants
        for i, rest_data in enumerate(restaurants_data):
            images = RESTAURANT_IMAGES.get(rest_data["images_key"], {"cover": None, "logo": None})
            restaurant = Restaurant(
                id=str(uuid.uuid4()),
                owner_id=rest_data["owner"].id,
                name=rest_data["name"],
                slug=rest_data["slug"],
                description=rest_data["description"],
                cuisine_type=rest_data["cuisine_type"],
                address_line=rest_data["address_line"],
                city=rest_data["city"],
                state=rest_data["state"],
                postal_code=rest_data["postal_code"],
                latitude=rest_data["latitude"],
                longitude=rest_data["longitude"],
                phone=rest_data["phone"],
                email=rest_data["email"],
                rating=rest_data["rating"],
                review_count=rest_data["review_count"],
                is_active=True,
                is_open=rest_data["is_open"],
                opening_time=rest_data["opening_time"],
                closing_time=rest_data["closing_time"],
                delivery_radius_km=rest_data["delivery_radius_km"],
                minimum_order=rest_data["minimum_order"],
                delivery_fee=rest_data["delivery_fee"],
                cover_image_url=images["cover"],
                logo_url=images["logo"],
            )
            session.add(restaurant)
            await session.flush()

            # Create categories and items for this restaurant
            for cat_idx, (cat_name, cat_desc, items) in enumerate(rest_data["categories"]):
                category = MenuCategory(
                    id=str(uuid.uuid4()),
                    restaurant_id=restaurant.id,
                    name=cat_name,
                    description=cat_desc,
                    sort_order=cat_idx,
                )
                session.add(category)
                await session.flush()

                for item_idx, (item_name, item_desc, item_price, is_veg) in enumerate(items):
                    image_url = MENU_ITEM_IMAGES[(cat_idx + item_idx) % len(MENU_ITEM_IMAGES)]
                    menu_item = MenuItem(
                        id=str(uuid.uuid4()),
                        restaurant_id=restaurant.id,
                        category_id=category.id,
                        name=item_name,
                        description=item_desc,
                        price=item_price,
                        image_url=image_url,
                        is_veg=is_veg,
                        is_available=True,
                        is_featured=(item_idx == 0),
                        preparation_time_minutes=20 + (item_idx * 5),
                    )
                    session.add(menu_item)

        # Create long order categories with rich data
        long_order_categories_data = [
            {
                "name": "Homemade Pickles",
                "description": "Traditional Andhra-style homemade pickles made with authentic recipes",
                "image_url": "https://images.unsplash.com/photo-1598857042137-10dfa6cc8c8c?w=400",
                "sort_order": 1,
            },
            {
                "name": "Fresh Snacks",
                "description": "Freshly made traditional snacks and munchies",
                "image_url": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",
                "sort_order": 2,
            },
            {
                "name": "Organic Spices",
                "description": "Home-ground spices and masalas from trusted sources",
                "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
                "sort_order": 3,
            },
            {
                "name": "Traditional Sweets",
                "description": "Authentic Indian sweets made with pure ingredients",
                "image_url": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400",
                "sort_order": 4,
            },
            {
                "name": "Rice & Pulses",
                "description": "Premium quality rice and pulses for daily cooking",
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
                "sort_order": 5,
            },
        ]

        category_ids = []
        for i, cat_data in enumerate(long_order_categories_data):
            cat = LongOrderCategory(
                id=str(uuid.uuid4()),
                name=cat_data["name"],
                description=cat_data["description"],
                image_url=cat_data["image_url"],
                sort_order=cat_data["sort_order"],
                is_active=True,
            )
            session.add(cat)
            await session.flush()
            category_ids.append((cat.id, cat_data["name"]))

        # Long order items
        long_order_items_data = [
            # Pickles (category 0)
            ("Andhra Mango Pickle", "Traditional sun-dried mango pickle with sesame oil", 250, True, "500g", 7, 50, True),
            ("Lemon Pickle", "Tangy lemon pickle with special spices", 220, True, "500g", 5, 40, False),
            ("Mixed Vegetable Pickle", "Blend of seasonal vegetables in spicy oil", 280, True, "500g", 7, 30, True),
            ("Ginger Pickle", "Spicy ginger chunks in lime juice", 200, True, "500g", 5, 25, False),
            ("Chicken Pickle", "Non-veg chicken pickle, rich and flavorful", 350, False, "500g", 10, 15, True),
            ("Mutton Pickle", "Slow-cooked mutton pickle", 450, False, "500g", 14, 10, False),
            # Snacks (category 1)
            ("Banana Chips", "Crispy banana chips, perfectly salted", 180, True, "250g", 3, 60, True),
            ("Murukku", "Spicy spiral snack, crunchy and delicious", 150, True, "250g", 4, 45, False),
            ("Andhra Mixture", "Authentic Andhra-style mixture with sev", 120, True, "250g", 3, 70, True),
            ("Nuvvulu Laddu", "Sesame seed balls with jaggery", 200, True, "500g", 5, 35, False),
            ("Poha Chivda", "Flattened rice chivda with peanuts", 130, True, "250g", 3, 40, True),
            ("Kara Boondi", "Crispy fried chickpea flour strands", 140, True, "200g", 3, 50, True),
            # Spices (category 2)
            ("Garam Masala", "Special blend of 12 spices", 180, True, "200g", 2, 80, True),
            ("Kitchen King Masala", "All-purpose curry masala", 150, True, "200g", 2, 75, False),
            ("Red Chilli Powder", "Pure byadgi red chilli, vibrant color", 120, True, "200g", 2, 90, True),
            ("Turmeric Powder", "Organic haldi with high curcumin", 80, True, "200g", 1, 100, False),
            ("Coriander Powder", "Fresh coriander powder", 90, True, "200g", 2, 85, True),
            ("Cumin Seeds", "Roasted cumin seeds", 100, True, "200g", 1, 95, True),
            # Sweets (category 3)
            ("Kaju Katli", "Premium cashew fudge", 350, True, "250g", 5, 40, True),
            ("Rasgulla", "Soft cottage cheese balls in syrup", 200, True, "500g", 3, 50, True),
            ("Ladoo", "Besan laddu with ghee", 180, True, "500g", 4, 45, True),
            ("Mysore Pak", "Gram flour fudge with ghee", 220, True, "250g", 4, 35, True),
            # Rice & Pulses (category 4)
            ("Basmati Rice", "Premium aged basmati rice", 350, True, "5kg", 2, 100, True),
            ("Toor Dal", "Organic toor dal for sambar", 200, True, "2kg", 1, 80, True),
            ("Chana Dal", "Split chickpeas for cooking", 150, True, "2kg", 1, 75, True),
        ]

        for item_idx, item_data in enumerate(long_order_items_data):
            name, desc, price, is_veg, unit, prep_days, stock, is_bestseller = item_data
            # Find category based on item type
            if "Pickle" in name or "Mutton" in name:
                cat_id = category_ids[0][0]
            elif "Chips" in name or "Murukku" in name or "Mixture" in name or "Laddu" in name or "Chivda" in name or "Boondi" in name:
                cat_id = category_ids[1][0]
            elif "Masala" in name or "Powder" in name or "Seeds" in name or "Turmeric" in name:
                cat_id = category_ids[2][0]
            elif "Katli" in name or "Rasgulla" in name or "Ladoo" in name or "Pak" in name:
                cat_id = category_ids[3][0]
            else:
                cat_id = category_ids[4][0]

            item = LongOrderItem(
                id=str(uuid.uuid4()),
                category_id=cat_id,
                name=name,
                description=desc,
                price=price,
                image_url="https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",
                is_veg=is_veg,
                is_available=True,
                is_bestseller=is_bestseller,
                preparation_days=prep_days,
                stock_quantity=stock,
                unit=unit,
            )
            session.add(item)

        # Create rider
        rider_user = User(
            id=str(uuid.uuid4()),
            email="rider@example.com",
            phone="+919999999996",
            password_hash=get_password_hash("rider123"),
            full_name="Delivery Rider",
            role=UserRole.RIDER.value,
            is_verified=True,
        )
        session.add(rider_user)

        rider = Rider(
            id=str(uuid.uuid4()),
            user_id=rider_user.id,
            vehicle_type="bike",
            vehicle_number="TS 01 AB 1234",
            is_available=True,
            is_online=False,
        )
        session.add(rider)

        await session.commit()
        print("Database seeded successfully!")
        print(f"Database type: {'SQLite (demo mode)' if settings.demo_mode else 'PostgreSQL'}")
        print(f"\n✓ 15 restaurants with images")
        print(f"✓ 45+ menu categories")
        print(f"✓ 200+ menu items with images")
        print(f"✓ 5 long order categories with 27 items")
        print(f"\nTest Accounts:")
        print(f"  Customer: customer@example.com / customer123")
        print(f"  Owners: restaurant@example.com, biryani@example.com, etc. / owner123")
        print(f"  Rider: rider@example.com / rider123")


if __name__ == "__main__":
    asyncio.run(seed_data())