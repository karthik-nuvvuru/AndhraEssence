from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "andhra_essence",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max
    result_expires=3600,  # Results expire after 1 hour
)

# Celery Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "cleanup-expired-sessions": {
        "task": "app.workers.tasks.cleanup_expired_sessions",
        "schedule": crontab(minute=0),  # Every hour
    },
    "update-restaurant-ratings": {
        "task": "app.workers.tasks.update_restaurant_ratings",
        "schedule": crontab(minute=0, hour="*/6"),  # Every 6 hours
    },
    "process-refund-requests": {
        "task": "app.workers.tasks.process_refund_requests",
        "schedule": crontab(minute="*/15"),  # Every 15 minutes
    },
    "check-pending-orders": {
        "task": "app.workers.tasks.check_pending_orders",
        "schedule": crontab(minute="*/5"),  # Every 5 minutes
    },
}
