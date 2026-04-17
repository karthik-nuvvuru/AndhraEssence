FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1

# Install system dependencies (minimal for FastAPI)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install pip
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3

# Set work directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml .

# Install dependencies (excluding weasyprint which requires GTK)
RUN pip install --no-cache-dir \
    fastapi==0.110.0 \
    uvicorn[standard]==0.27.0 \
    python-multipart==0.0.9 \
    sqlalchemy[asyncio]==2.0.25 \
    asyncpg==0.29.0 \
    alembic==1.13.1 \
    psycopg2-binary==2.9.9 \
    python-jose[cryptography]==3.3.0 \
    passlib[bcrypt]==1.7.4 \
    pydantic==2.6.0 \
    pydantic-settings==2.1.0 \
    email-validator==2.1.0 \
    redis[hiredis]==5.0.1 \
    celery==5.3.6 \
    python-dateutil==2.8.2 \
    python-dotenv==1.0.0 \
    httpx==0.27.0 \
    geopy==2.4.1 \
    razorpay==1.4.2

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
