from fastapi import APIRouter

from app.core.config import settings
from app.core.redis_client import redis_client

router = APIRouter()


@router.get("/health")
def health_check() -> dict:
    redis_status = "ok"
    try:
        redis_client.ping()
    except Exception:
        redis_status = "unavailable"

    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "redis": redis_status,
    }
