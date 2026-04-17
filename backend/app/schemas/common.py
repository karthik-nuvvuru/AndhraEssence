from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UUIDMixin(BaseModel):
    """Mixin for UUID id field."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID


class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = 1
    limit: int = 20
    offset: Optional[int] = None

    @property
    def skip(self) -> int:
        if self.offset is not None:
            return self.offset
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    items: list
    total: int
    page: int
    limit: int
    pages: int


class SuccessResponse(BaseModel):
    """Generic success response."""
    success: bool = True
    message: str
    data: Optional[dict] = None
