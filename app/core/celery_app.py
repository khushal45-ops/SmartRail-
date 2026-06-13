from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "railway_worker",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["celery_worker", "app.services.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    worker_prefetch_multiplier=1,
    broker_connection_retry_on_startup=True,
    redis_backend_health_check_interval=30,
)
