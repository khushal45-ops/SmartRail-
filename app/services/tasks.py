from app.core.celery_app import celery_app


@celery_app.task(name="app.services.tasks.send_notification")
def send_notification(recipient: str, message: str) -> dict:
    return {
        "recipient": recipient,
        "message": message,
        "status": "queued",
    }
