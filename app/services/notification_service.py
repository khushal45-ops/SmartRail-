import logging

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client

from app.core.config import settings

logger = logging.getLogger(__name__)


class NotificationService:
    @staticmethod
    def _twilio_configured() -> bool:
        return bool(
            settings.twilio_sid
            and settings.twilio_auth_token
            and settings.twilio_phone_number
        )

    @staticmethod
    def _sendgrid_configured() -> bool:
        return bool(settings.sendgrid_key and settings.sendgrid_from_email)

    @staticmethod
    def send_sms(to_number: str, message: str) -> dict:
        if not NotificationService._twilio_configured():
            logger.warning("Twilio not configured — skipping SMS to %s", to_number)
            return {"status": "skipped", "reason": "twilio_not_configured", "to": to_number}

        client = Client(settings.twilio_sid, settings.twilio_auth_token)
        result = client.messages.create(
            body=message,
            from_=settings.twilio_phone_number,
            to=to_number,
        )
        return {"status": "sent", "to": to_number, "sid": result.sid}

    @staticmethod
    def send_email(to_email: str, subject: str, message: str) -> dict:
        if not NotificationService._sendgrid_configured():
            logger.warning("SendGrid not configured — skipping email to %s", to_email)
            return {"status": "skipped", "reason": "sendgrid_not_configured", "to": to_email}

        mail = Mail(
            from_email=settings.sendgrid_from_email,
            to_emails=to_email,
            subject=subject,
            plain_text_content=message,
        )
        client = SendGridAPIClient(settings.sendgrid_key)
        response = client.send(mail)
        return {
            "status": "sent",
            "to": to_email,
            "status_code": response.status_code,
        }

    @staticmethod
    def send_delay_notifications(
        message: str,
        email_recipients: list[str],
        sms_recipients: list[str],
    ) -> dict:
        subject = "Railway Delay Alert"
        sms_results = [
            NotificationService.send_sms(number, message) for number in sms_recipients
        ]
        email_results = [
            NotificationService.send_email(email, subject, message)
            for email in email_recipients
        ]
        return {"sms": sms_results, "email": email_results}
