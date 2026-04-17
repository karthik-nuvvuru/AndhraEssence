from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application
    app_name: str = "AndhraEssence"
    environment: str = "development"
    debug: bool = True
    api_version: str = "v1"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/andhraessence"
    database_pool_size: int = 20
    database_max_overflow: int = 10

    # Demo mode - uses SQLite when True (no external PostgreSQL needed)
    demo_mode: bool = False
    sqlite_database_path: str = "andhraessence_demo.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_cache_ttl: int = 3600

    # JWT
    jwt_secret_key: str = "change-this-secret-key-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""

    # Google Maps
    google_maps_api_key: str = ""

    # SMTP
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "noreply@andhraessence.com"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8081"]

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return self.cors_origins

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def use_sqlite(self) -> bool:
        """Check if demo mode is enabled or PostgreSQL is unavailable."""
        return self.demo_mode

    @property
    def effective_database_url(self) -> str:
        """Get the database URL to use, falling back to SQLite in demo mode."""
        if self.demo_mode:
            return f"sqlite+aiosqlite:///{self.sqlite_database_path}"
        return self.database_url


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
