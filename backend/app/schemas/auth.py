from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """User registration schema."""

    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = "customer"  # customer, restaurant_owner, rider


class UserLogin(BaseModel):
    """User login schema."""

    email: EmailStr
    password: str


class OTPVerify(BaseModel):
    """OTP verification schema."""

    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirm schema."""

    token: str
    new_password: str = Field(..., min_length=6)


class ChangePasswordRequest(BaseModel):
    """Change password request schema."""

    current_password: str
    new_password: str = Field(..., min_length=6)
