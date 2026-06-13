import logging

from app.core.celery_app import celery_app
from app.core.config import settings
from app.core.database import SessionLocal
from app.services.alert_service import AlertService
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

__all__ = ["celery_app", "send_delay_alert"]


@celery_app.task(name="send_delay_alert", bind=True, max_retries=3, default_retry_delay=60)
def send_delay_alert(self, train_id: int, delay_minutes: float) -> dict:
    """
    Send delay alert via Twilio SMS and SendGrid email, then log to alerts table.
    """
    db = SessionLocal()
    try:
        train = AlertService.get_train(db, train_id)
        if not train:
            return {"train_id": train_id, "status": "failed", "error": "train_not_found"}

        message = AlertService.build_delay_message(train, delay_minutes)
        passenger_emails = AlertService.get_passenger_emails(db, train_id)

        email_recipients = passenger_emails.copy()
        if settings.alert_email_to and settings.alert_email_to not in email_recipients:
            email_recipients.append(settings.alert_email_to)

        sms_recipients: list[str] = []
        if settings.alert_sms_to:
            sms_recipients.append(settings.alert_sms_to)

        try:
            delivery = NotificationService.send_delay_notifications(
                message=message,
                email_recipients=email_recipients,
                sms_recipients=sms_recipients,
            )
        except Exception as exc:
            logger.exception("Notification delivery failed for train %s", train_id)
            delivery = {"status": "failed", "error": str(exc)}
            raise self.retry(exc=exc) from exc

        alert = AlertService.log_alert(
            db,
            train_id=train_id,
            alert_type="delay",
            message=message,
        )

        return {
            "train_id": train_id,
            "delay_minutes": delay_minutes,
            "alert_id": alert.id,
            "delivery": delivery,
            "status": "completed",
        }
    finally:
        db.close()
