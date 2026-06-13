from functools import lru_cache
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "Railway Management System API"
    app_version: str = "1.0.0"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/railway_db"
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    delay_alert_threshold_minutes: int = 60

    twilio_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    sendgrid_key: str = ""
    sendgrid_from_email: str = ""
    alert_sms_to: str = ""
    alert_email_to: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
