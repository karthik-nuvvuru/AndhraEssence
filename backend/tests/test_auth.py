"""Tests for authentication endpoints."""
import pytest
from tests.conftest import auth_header


class TestRegister:
    """Tests for user registration."""

    async def test_register_success(self, client):
        """Test successful registration."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "newuser@example.com",
            "password": "password123",
            "phone": "+1234567890",
            "full_name": "New User",
            "role": "customer"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    async def test_register_duplicate_email(self, client, seeded_db):
        """Test registration with existing email fails."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "admin@andhraessence.com",
            "password": "password123",
            "phone": "+1234567891",
            "full_name": "Another User",
            "role": "customer"
        })
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    async def test_register_duplicate_phone(self, client, seeded_db):
        """Test registration with existing phone fails."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "unique@example.com",
            "password": "password123",
            "phone": "+919999999999",
            "full_name": "Another User",
            "role": "customer"
        })
        assert response.status_code == 400
        assert "Phone number already registered" in response.json()["detail"]

    async def test_register_invalid_email(self, client):
        """Test registration with invalid email fails."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "not-an-email",
            "password": "password123",
            "phone": "+1234567892",
            "full_name": "New User",
            "role": "customer"
        })
        assert response.status_code == 422

    async def test_register_short_password(self, client):
        """Test registration with short password fails."""
        response = await client.post("/api/v1/auth/register", json={
            "email": "shortpw@example.com",
            "password": "12345",
            "phone": "+1234567893",
            "full_name": "New User",
            "role": "customer"
        })
        assert response.status_code == 422


class TestLogin:
    """Tests for user login."""

    async def test_login_success(self, client, seeded_db):
        """Test successful login."""
        response = await client.post("/api/v1/auth/login", json={
            "email": "customer@example.com",
            "password": "customer123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_login_wrong_password(self, client, seeded_db):
        """Test login with wrong password fails."""
        response = await client.post("/api/v1/auth/login", json={
            "email": "customer@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    async def test_login_nonexistent_user(self, client):
        """Test login with non-existent user fails."""
        response = await client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password123"
        })
        assert response.status_code == 401

    async def test_login_inactive_user(self, client, seeded_db, db_session):
        """Test login with inactive user fails."""
        from app.demo_models.user import User
        from sqlalchemy import update

        # Deactivate user
        await db_session.execute(
            update(User).where(User.email == "customer@example.com").values(is_active=False)
        )
        await db_session.commit()

        response = await client.post("/api/v1/auth/login", json={
            "email": "customer@example.com",
            "password": "customer123"
        })
        assert response.status_code == 401

        # Restore - get fresh session
        from app.database import async_session_factory
        async with async_session_factory() as restore_session:
            await restore_session.execute(
                update(User).where(User.email == "customer@example.com").values(is_active=True)
            )
            await restore_session.commit()


class TestRefresh:
    """Tests for token refresh."""

    async def test_refresh_success(self, client, seeded_db):
        """Test successful token refresh."""
        # First login
        login_response = await client.post("/api/v1/auth/login", json={
            "email": "customer@example.com",
            "password": "customer123"
        })
        refresh_token = login_response.json()["refresh_token"]

        # Refresh token
        response = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_refresh_invalid_token(self, client):
        """Test refresh with invalid token fails."""
        response = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid-token"
        })
        assert response.status_code == 401

    async def test_refresh_wrong_type_token(self, client, seeded_db):
        """Test refresh with access token instead of refresh token fails."""
        # Login to get access token
        login_response = await client.post("/api/v1/auth/login", json={
            "email": "customer@example.com",
            "password": "customer123"
        })
        access_token = login_response.json()["access_token"]

        # Try to use access token as refresh token
        response = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": access_token
        })
        assert response.status_code == 401


class TestLogout:
    """Tests for user logout."""

    async def test_logout_success(self, client, customer_token):
        """Test successful logout."""
        response = await client.post(
            "/api/v1/auth/logout",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 200
        assert "Logged out successfully" in response.json()["message"]

    async def test_logout_no_token(self, client):
        """Test logout without token still succeeds (token is optional)."""
        response = await client.post("/api/v1/auth/logout")
        # Logout is idempotent and doesn't fail even without a token
        assert response.status_code == 200


class TestMe:
    """Tests for /me endpoint."""

    async def test_me_success(self, client, customer_token):
        """Test successful /me retrieval."""
        response = await client.get(
            "/api/v1/auth/me",
            headers=auth_header(customer_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "customer@example.com"
        assert data["role"] == "customer"

    async def test_me_no_token(self, client):
        """Test /me without token fails."""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401