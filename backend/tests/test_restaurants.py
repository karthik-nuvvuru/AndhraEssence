"""Tests for restaurant endpoints."""

from tests.conftest import auth_header


class TestListRestaurants:
    """Tests for listing restaurants."""

    async def test_list_restaurants_empty(self, client, seeded_db):
        """Test listing all restaurants."""
        response = await client.get("/api/v1/restaurants")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data

    async def test_list_restaurants_with_filters(self, client, seeded_db):
        """Test listing restaurants with filters."""
        response = await client.get("/api/v1/restaurants?city=Hyderabad&cuisine=Andhra")
        assert response.status_code == 200

    async def test_list_restaurants_pagination(self, client, seeded_db):
        """Test restaurant pagination."""
        response = await client.get("/api/v1/restaurants?page=1&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 10

    async def test_list_restaurants_rating_filter(self, client, seeded_db):
        """Test filtering by minimum rating."""
        response = await client.get("/api/v1/restaurants?min_rating=4.0")
        assert response.status_code == 200

    async def test_list_restaurants_is_open_filter(self, client, seeded_db):
        """Test filtering by open status."""
        response = await client.get("/api/v1/restaurants?is_open=true")
        assert response.status_code == 200


class TestGetRestaurant:
    """Tests for getting restaurant details."""

    async def test_get_restaurant_success(self, client, seeded_db):
        """Test getting a single restaurant."""
        # First list restaurants to get one ID
        list_response = await client.get("/api/v1/restaurants")
        items = list_response.json()["items"]
        if items:
            restaurant_id = items[0]["id"]
            response = await client.get(f"/api/v1/restaurants/{restaurant_id}")
            assert response.status_code == 200
            data = response.json()
            assert "name" in data
            assert "owner" in data

    async def test_get_restaurant_not_found(self, client, seeded_db):
        """Test getting non-existent restaurant."""
        response = await client.get(
            "/api/v1/restaurants/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404


class TestCreateRestaurant:
    """Tests for creating restaurants."""

    async def test_create_restaurant_success(self, client, owner_token, seeded_db):
        """Test successful restaurant creation by owner."""
        response = await client.post(
            "/api/v1/restaurants",
            json={
                "name": "New Restaurant",
                "description": "A new test restaurant",
                "cuisine_type": "Indian",
                "address_line": "789 New Street",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500003",
                "latitude": 17.3950,
                "longitude": 78.4850,
                "phone": "+919999999900",
                "email": "new@restaurant.com",
                "delivery_radius_km": 5.0,
                "minimum_order": 100,
                "delivery_fee": 30,
            },
            headers=auth_header(owner_token),
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Restaurant"
        assert data["slug"] == "new-restaurant"

    async def test_create_restaurant_customer_forbidden(self, client, customer_token):
        """Test that customer cannot create restaurant."""
        response = await client.post(
            "/api/v1/restaurants",
            json={
                "name": "Customer Restaurant",
                "address_line": "123 Test St",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500001",
                "latitude": 17.3850,
                "longitude": 78.4867,
            },
            headers=auth_header(customer_token),
        )
        assert response.status_code == 403

    async def test_create_restaurant_no_auth(self, client):
        """Test creating restaurant without authentication."""
        response = await client.post(
            "/api/v1/restaurants",
            json={
                "name": "Unauthorized Restaurant",
                "address_line": "123 Test St",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500001",
                "latitude": 17.3850,
                "longitude": 78.4867,
            },
        )
        assert response.status_code == 401

    async def test_create_restaurant_admin(self, client, admin_token, seeded_db):
        """Test that admin can create restaurant."""
        response = await client.post(
            "/api/v1/restaurants",
            json={
                "name": "Admin Restaurant",
                "description": "Created by admin",
                "cuisine_type": "Fusion",
                "address_line": "999 Admin Ave",
                "city": "Hyderabad",
                "state": "Telangana",
                "postal_code": "500004",
                "latitude": 17.4000,
                "longitude": 78.4900,
            },
            headers=auth_header(admin_token),
        )
        assert response.status_code == 200


class TestUpdateRestaurant:
    """Tests for updating restaurants."""

    async def test_update_restaurant_success(self, client, owner_token, seeded_db):
        """Test successful restaurant update by owner."""
        # Get owner's restaurant
        list_response = await client.get("/api/v1/restaurants?city=Hyderabad")
        for _restaurant in list_response.json()["items"]:
            # Find restaurant owned by restaurant@example.com
            pass

        # As the seeded restaurant owner has restaurant - let's find it
        # First get the owner token to know which restaurant they own
        # Get owner user info
        me_response = await client.get(
            "/api/v1/auth/me", headers=auth_header(owner_token)
        )
        owner_id = me_response.json()["id"]

        # List restaurants and find the one owned by this owner
        restaurants_response = await client.get("/api/v1/restaurants")
        restaurants = restaurants_response.json()["items"]

        owner_restaurant = None
        for r in restaurants:
            if r.get("owner_id") == owner_id:
                owner_restaurant = r
                break

        if owner_restaurant:
            restaurant_id = owner_restaurant["id"]
            response = await client.put(
                f"/api/v1/restaurants/{restaurant_id}",
                json={"name": "Updated Restaurant Name", "is_open": False},
                headers=auth_header(owner_token),
            )
            assert response.status_code == 200
            assert response.json()["name"] == "Updated Restaurant Name"
            assert response.json()["is_open"] is False

    async def test_update_restaurant_not_owner(self, client, customer_token, seeded_db):
        """Test that non-owner cannot update restaurant."""
        # Get a restaurant ID
        list_response = await client.get("/api/v1/restaurants")
        items = list_response.json()["items"]
        if items:
            restaurant_id = items[0]["id"]
            response = await client.put(
                f"/api/v1/restaurants/{restaurant_id}",
                json={"name": "Hacked Name"},
                headers=auth_header(customer_token),
            )
            assert response.status_code == 403

    async def test_update_restaurant_not_found(self, client, owner_token):
        """Test updating non-existent restaurant."""
        response = await client.put(
            "/api/v1/restaurants/00000000-0000-0000-0000-000000000000",
            json={"name": "Test"},
            headers=auth_header(owner_token),
        )
        assert response.status_code == 404


class TestDeleteRestaurant:
    """Tests for deleting restaurants."""

    async def test_delete_restaurant_success(self, client, owner_token, seeded_db):
        """Test successful restaurant deletion by owner."""
        # Get owner restaurant ID
        me_response = await client.get(
            "/api/v1/auth/me", headers=auth_header(owner_token)
        )
        owner_id = me_response.json()["id"]

        restaurants_response = await client.get("/api/v1/restaurants")
        restaurants = restaurants_response.json()["items"]

        owner_restaurant = None
        for r in restaurants:
            if r.get("owner_id") == owner_id:
                owner_restaurant = r
                break

        if owner_restaurant:
            restaurant_id = owner_restaurant["id"]
            response = await client.delete(
                f"/api/v1/restaurants/{restaurant_id}", headers=auth_header(owner_token)
            )
            assert response.status_code == 200

    async def test_delete_restaurant_customer_forbidden(
        self, client, customer_token, seeded_db
    ):
        """Test that customer cannot delete restaurant."""
        list_response = await client.get("/api/v1/restaurants")
        items = list_response.json()["items"]
        if items:
            restaurant_id = items[0]["id"]
            response = await client.delete(
                f"/api/v1/restaurants/{restaurant_id}",
                headers=auth_header(customer_token),
            )
            assert response.status_code == 403
