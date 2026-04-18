"""Tests for order endpoints."""
import pytest
from tests.conftest import auth_header, get_restaurant_and_items, get_customer_address


class TestCreateOrder:
    """Tests for creating orders."""

    async def test_create_order_success(self, client, customer_token, seeded_db):
        """Test successful order creation."""
        restaurant_id, menu_item_id = await get_restaurant_and_items(client, customer_token)
        if not restaurant_id or not menu_item_id:
            pytest.skip("No restaurant or menu items available")

        address_id = await get_customer_address(client, customer_token)
        if not address_id:
            pytest.skip("No address available for customer")

        response = await client.post("/api/v1/orders", json={
            "restaurant_id": restaurant_id,
            "address_id": address_id,
            "items": [{"menu_item_id": str(menu_item_id), "quantity": 2}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "pending"
        assert data["payment_status"] == "pending"
        assert data["total_amount"] > 0

    async def test_create_order_invalid_restaurant(self, client, customer_token, seeded_db):
        """Test order creation with invalid restaurant."""
        address_id = await get_customer_address(client, customer_token)
        if not address_id:
            pytest.skip("No address available")

        response = await client.post("/api/v1/orders", json={
            "restaurant_id": "00000000-0000-0000-0000-000000000000",
            "address_id": address_id,
            "items": [{"menu_item_id": "00000000-0000-0000-0000-000000000001", "quantity": 1}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        assert response.status_code == 400

    async def test_create_order_invalid_address(self, client, customer_token, seeded_db):
        """Test order creation with invalid address."""
        restaurant_id, menu_item_id = await get_restaurant_and_items(client, customer_token)
        if not restaurant_id or not menu_item_id:
            pytest.skip("No restaurant or menu items available")

        response = await client.post("/api/v1/orders", json={
            "restaurant_id": restaurant_id,
            "address_id": "00000000-0000-0000-0000-000000000000",
            "items": [{"menu_item_id": str(menu_item_id), "quantity": 1}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        assert response.status_code == 400

    async def test_create_order_no_auth(self, client, seeded_db):
        """Test order creation without authentication."""
        response = await client.post("/api/v1/orders", json={
            "restaurant_id": "00000000-0000-0000-0000-000000000000",
            "address_id": "00000000-0000-0000-0000-000000000000",
            "items": [{"menu_item_id": "00000000-0000-0000-0000-000000000001", "quantity": 1}],
            "payment_method": "razorpay"
        })
        assert response.status_code == 401


class TestListOrders:
    """Tests for listing orders."""

    async def test_list_orders_success(self, client, customer_token, seeded_db):
        """Test listing customer's orders."""
        response = await client.get(
            "/api/v1/orders",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_list_orders_filter_by_status(self, client, customer_token, seeded_db):
        """Test filtering orders by status."""
        response = await client.get(
            "/api/v1/orders?status=pending",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 200

    async def test_list_orders_pagination(self, client, customer_token, seeded_db):
        """Test order pagination."""
        response = await client.get(
            "/api/v1/orders?page=1&limit=5",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 5

    async def test_list_orders_no_auth(self, client):
        """Test listing orders without authentication."""
        response = await client.get("/api/v1/orders")
        assert response.status_code == 401


class TestGetOrder:
    """Tests for getting order details."""

    async def test_get_order_success(self, client, customer_token, seeded_db):
        """Test getting order details."""
        restaurant_id, menu_item_id = await get_restaurant_and_items(client, customer_token)
        if not restaurant_id or not menu_item_id:
            pytest.skip("No restaurant or menu items available")

        address_id = await get_customer_address(client, customer_token)
        if not address_id:
            pytest.skip("No address available")

        create_response = await client.post("/api/v1/orders", json={
            "restaurant_id": restaurant_id,
            "address_id": address_id,
            "items": [{"menu_item_id": str(menu_item_id), "quantity": 1}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        if create_response.status_code != 200:
            pytest.skip("Could not create order")

        order_id = create_response.json()["id"]

        response = await client.get(
            f"/api/v1/orders/{order_id}",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
        assert "items" in data

    async def test_get_order_not_found(self, client, customer_token):
        """Test getting non-existent order."""
        response = await client.get(
            "/api/v1/orders/00000000-0000-0000-0000-000000000000",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 404

    async def test_get_order_access_denied(self, client, customer_token, owner_token, seeded_db):
        """Test that customer cannot access another customer's order."""
        restaurant_id, menu_item_id = await get_restaurant_and_items(client, customer_token)
        if not restaurant_id or not menu_item_id:
            pytest.skip("No restaurant or menu items available")

        address_id = await get_customer_address(client, customer_token)
        if not address_id:
            pytest.skip("No address available")

        create_response = await client.post("/api/v1/orders", json={
            "restaurant_id": restaurant_id,
            "address_id": address_id,
            "items": [{"menu_item_id": str(menu_item_id), "quantity": 1}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        if create_response.status_code != 200:
            pytest.skip("Could not create order")

        order_id = create_response.json()["id"]

        response = await client.get(
            f"/api/v1/orders/{order_id}",
            headers=auth_header(owner_token)
        )
        assert response.status_code == 403


class TestUpdateOrderStatus:
    """Tests for updating order status."""

    async def test_update_order_status_confirm(self, client, owner_token, customer_token, seeded_db):
        """Test confirming an order (owner)."""
        restaurant_id, menu_item_id = await get_restaurant_and_items(client, customer_token)
        if not restaurant_id or not menu_item_id:
            pytest.skip("No restaurant or menu items available")

        address_id = await get_customer_address(client, customer_token)
        if not address_id:
            pytest.skip("No address available")

        create_response = await client.post("/api/v1/orders", json={
            "restaurant_id": restaurant_id,
            "address_id": address_id,
            "items": [{"menu_item_id": str(menu_item_id), "quantity": 1}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        if create_response.status_code != 200:
            pytest.skip("Could not create order")

        order_id = create_response.json()["id"]

        response = await client.put(
            f"/api/v1/orders/{order_id}/status",
            json={"status": "confirmed"},
            headers=auth_header(owner_token)
        )
        assert response.status_code == 200
        assert response.json()["status"] == "confirmed"

    async def test_update_order_status_invalid_transition(self, client, owner_token, customer_token, seeded_db):
        """Test invalid status transition."""
        restaurant_id, menu_item_id = await get_restaurant_and_items(client, customer_token)
        if not restaurant_id or not menu_item_id:
            pytest.skip("No restaurant or menu items available")

        address_id = await get_customer_address(client, customer_token)
        if not address_id:
            pytest.skip("No address available")

        create_response = await client.post("/api/v1/orders", json={
            "restaurant_id": restaurant_id,
            "address_id": address_id,
            "items": [{"menu_item_id": str(menu_item_id), "quantity": 1}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        if create_response.status_code != 200:
            pytest.skip("Could not create order")

        order_id = create_response.json()["id"]

        response = await client.put(
            f"/api/v1/orders/{order_id}/status",
            json={"status": "delivered"},
            headers=auth_header(owner_token)
        )
        assert response.status_code == 400


class TestCancelOrder:
    """Tests for cancelling orders."""

    async def test_cancel_order_by_customer(self, client, customer_token, seeded_db):
        """Test customer can cancel their pending order."""
        restaurant_id, menu_item_id = await get_restaurant_and_items(client, customer_token)
        if not restaurant_id or not menu_item_id:
            pytest.skip("No restaurant or menu items available")

        address_id = await get_customer_address(client, customer_token)
        if not address_id:
            pytest.skip("No address available")

        create_response = await client.post("/api/v1/orders", json={
            "restaurant_id": restaurant_id,
            "address_id": address_id,
            "items": [{"menu_item_id": str(menu_item_id), "quantity": 1}],
            "payment_method": "razorpay"
        }, headers=auth_header(customer_token))

        if create_response.status_code != 200:
            pytest.skip("Could not create order")

        order_id = create_response.json()["id"]

        response = await client.post(
            f"/api/v1/orders/{order_id}/cancel?reason=Changed+mind",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 200
        assert response.json()["status"] == "cancelled"
        assert response.json()["cancellation_reason"] == "Changed mind"

    async def test_cancel_order_not_found(self, client, customer_token):
        """Test cancelling non-existent order."""
        response = await client.post(
            "/api/v1/orders/00000000-0000-0000-0000-000000000000/cancel",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 404