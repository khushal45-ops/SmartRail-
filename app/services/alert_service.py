from sqlalchemy.orm import Session, joinedload

from app.models.alert import Alert
from app.models.enums import TicketStatus
from app.models.ticket import Ticket
from app.models.train import Train


class AlertService:
    @staticmethod
    def get_train(db: Session, train_id: int) -> Train | None:
        return db.query(Train).filter(Train.id == train_id).first()

    @staticmethod
    def get_passenger_emails(db: Session, train_id: int) -> list[str]:
        tickets = (
            db.query(Ticket)
            .options(joinedload(Ticket.user))
            .filter(
                Ticket.train_id == train_id,
                Ticket.status == TicketStatus.ACTIVE,
            )
            .all()
        )
        emails = {ticket.user.email for ticket in tickets if ticket.user}
        return sorted(emails)

    @staticmethod
    def log_alert(db: Session, train_id: int, alert_type: str, message: str) -> Alert:
        alert = Alert(train_id=train_id, type=alert_type, message=message)
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def build_delay_message(train: Train, delay_minutes: float) -> str:
        return (
            f"Delay alert: Train {train.number} ({train.name}) on route {train.route} "
            f"is delayed by {delay_minutes:.0f} minutes."
        )
