"""Cross-database compatible types for SQLite/PostgreSQL fallback.

This module provides types that work with both PostgreSQL and SQLite,
allowing the application to run in demo mode with SQLite when PostgreSQL
is unavailable.

Usage:
    from app.db_types import GUID, StringArray, JSONType

Instead of:
    from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
"""
import json
import uuid as uuid_module
from typing import Any, List, Optional

from sqlalchemy import String, Text, TypeDecorator, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY as PG_ARRAY, JSONB as PG_JSONB


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type when available, otherwise uses String(36).
    SQLite stores UUIDs as strings, which is compatible with uuid.UUID objects.
    """

    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value if isinstance(value, uuid_module.UUID) else uuid_module.UUID(str(value))
        # SQLite: store as string
        if isinstance(value, uuid_module.UUID):
            return str(value)
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid_module.UUID):
            return value
        return uuid_module.UUID(str(value))


class StringArray(TypeDecorator):
    """Platform-independent array type.

    Uses PostgreSQL's ARRAY type when available, otherwise uses JSON.
    SQLite doesn't have native array support, so we store arrays as JSON strings.
    """

    impl = Text
    cache_ok = True

    def __init__(self, item_type=None, **kwargs):
        super().__init__(**kwargs)
        self.item_type = item_type

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            if self.item_type:
                return dialect.type_descriptor(PG_ARRAY(self.item_type))
            return dialect.type_descriptor(PG_ARRAY(String()))
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        # SQLite: store as JSON
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        # SQLite: parse JSON
        if isinstance(value, str):
            return json.loads(value)
        return value


class JSONType(TypeDecorator):
    """Platform-independent JSON type.

    Uses PostgreSQL's JSONB type when available, otherwise uses standard JSON.
    """

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_JSONB())
        return dialect.type_descriptor(JSON())


# For convenience, import UUID directly for use in Column definitions
# This is a direct replacement for: from sqlalchemy.dialects.postgresql import UUID
UUID = GUID
