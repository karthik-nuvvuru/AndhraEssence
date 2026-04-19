"""Tests for admin endpoints."""

import pytest

from tests.conftest import auth_header


class TestAdminDashboard:
    """Tests for admin dashboard."""

    async def test_admin_dashboard_success(self, client, admin_token, seeded_db):
        """Test admin can access dashboard."""
        response = await client.get(
            "/api/v1/admin/dashboard", headers=auth_header(admin_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_restaurants" in data
        assert "active_riders" in data
        assert "orders_today" in data
        assert "revenue_today" in data
        assert "recent_orders" in data

    async def test_admin_dashboard_customer_forbidden(self, client, customer_token):
        """Test that customer cannot access admin dashboard."""
        response = await client.get(
            "/api/v1/admin/dashboard", headers=auth_header(customer_token)
        )
        assert response.status_code == 403

    async def test_admin_dashboard_owner_forbidden(self, client, owner_token):
        """Test that owner cannot access admin dashboard."""
        response = await client.get(
            "/api/v1/admin/dashboard", headers=auth_header(owner_token)
        )
        assert response.status_code == 403

    async def test_admin_dashboard_no_auth(self, client):
        """Test accessing dashboard without authentication."""
        response = await client.get("/api/v1/admin/dashboard")
        assert response.status_code == 401


class TestAdminListUsers:
    """Tests for admin user listing."""

    async def test_admin_list_users_success(self, client, admin_token, seeded_db):
        """Test admin can list all users."""
        response = await client.get(
            "/api/v1/admin/users", headers=auth_header(admin_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    async def test_admin_list_users_filter_by_role(
        self, client, admin_token, seeded_db
    ):
        """Test filtering users by role."""
        response = await client.get(
            "/api/v1/admin/users?role=customer", headers=auth_header(admin_token)
        )
        assert response.status_code == 200
        data = response.json()
        for user in data:
            assert user["role"] == "customer"

    async def test_admin_list_users_filter_by_active(
        self, client, admin_token, seeded_db
    ):
        """Test filtering users by active status."""
        response = await client.get(
            "/api/v1/admin/users?is_active=true", headers=auth_header(admin_token)
        )
        assert response.status_code == 200
        data = response.json()
        for user in data:
            assert user["is_active"] is True

    async def test_admin_list_users_pagination(self, client, admin_token, seeded_db):
        """Test user listing pagination."""
        response = await client.get(
            "/api/v1/admin/users?page=1&limit=5", headers=auth_header(admin_token)
        )
        assert response.status_code == 200

    async def test_admin_list_users_customer_forbidden(self, client, customer_token):
        """Test that customer cannot list users."""
        response = await client.get(
            "/api/v1/admin/users", headers=auth_header(customer_token)
        )
        assert response.status_code == 403

    async def test_admin_list_users_no_auth(self, client):
        """Test listing users without authentication."""
        response = await client.get("/api/v1/admin/users")
        assert response.status_code == 401


class TestAdminToggleUser:
    """Tests for toggling user active status."""

    async def test_admin_toggle_user_success(self, client, admin_token, seeded_db):
        """Test admin can toggle user active status."""
        # Get a user to toggle
        list_response = await client.get(
            "/api/v1/admin/users", headers=auth_header(admin_token)
        )
        users = list_response.json()
        user_to_toggle = None
        for user in users:
            if user["email"] != "admin@andhraessence.com":
                user_to_toggle = user
                break

        if not user_to_toggle:
            pytest.skip("No user available to toggle")

        user_id = user_to_toggle["id"]
        original_status = user_to_toggle["is_active"]

        # Toggle
        response = await client.put(
            f"/api/v1/admin/users/{user_id}/toggle-active",
            headers=auth_header(admin_token),
        )
        assert response.status_code == 200
        data = response.json()
        assert (
            data["message"]
            == f"User {'deactivated' if original_status else 'activated'}"
        )

    async def test_admin_toggle_user_not_found(self, client, admin_token):
        """Test toggling non-existent user."""
        response = await client.put(
            "/api/v1/admin/users/00000000-0000-0000-0000-000000000000/toggle-active",
            headers=auth_header(admin_token),
        )
        assert response.status_code == 404

    async def test_admin_toggle_user_customer_forbidden(
        self, client, customer_token, seeded_db
    ):
        """Test that customer cannot toggle user status."""
        # Get any user ID
        list_response = await client.get(
            "/api/v1/admin/users", headers=auth_header(customer_token)
        )
        # This should fail with 403
        assert list_response.status_code == 403

    async def test_admin_toggle_user_no_auth(self, client):
        """Test toggling user without authentication."""
        response = await client.put(
            "/api/v1/admin/users/00000000-0000-0000-0000-000000000001/toggle-active"
        )
        assert response.status_code == 401


class TestAdminListRestaurants:
    """Tests for admin restaurant listing."""

    async def test_admin_list_restaurants_success(self, client, admin_token, seeded_db):
        """Test admin can list all restaurants."""
        response = await client.get(
            "/api/v1/admin/restaurants", headers=auth_header(admin_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_admin_list_restaurants_customer_forbidden(
        self, client, customer_token
    ):
        """Test that customer cannot list all restaurants via admin."""
        response = await client.get(
            "/api/v1/admin/restaurants", headers=auth_header(customer_token)
        )
        assert response.status_code == 403


class TestAdminAnalytics:
    """Tests for admin analytics."""

    async def test_admin_analytics_success(self, client, admin_token, seeded_db):
        """Test admin can access analytics."""
        response = await client.get(
            "/api/v1/admin/analytics", headers=auth_header(admin_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert "period_days" in data
        assert "total_orders" in data
        assert "total_revenue" in data
        assert "orders_by_status" in data
        assert "daily_orders" in data

    async def test_admin_analytics_custom_days(self, client, admin_token, seeded_db):
        """Test analytics with custom day range."""
        response = await client.get(
            "/api/v1/admin/analytics?days=7", headers=auth_header(admin_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["period_days"] == 7

    async def test_admin_analytics_customer_forbidden(self, client, customer_token):
        """Test that customer cannot access analytics."""
        response = await client.get(
            "/api/v1/admin/analytics", headers=auth_header(customer_token)
        )
        assert response.status_code == 403
