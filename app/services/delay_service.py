from sqlalchemy.orm import Session

from app.models.delay_log import DelayLog


class DelayService:
    @staticmethod
    def save_prediction(db: Session, train_id: int, predicted_delay: float) -> DelayLog:
        delay_log = DelayLog(
            train_id=train_id,
            predicted_delay=predicted_delay,
            actual_delay=None,
        )
        db.add(delay_log)
        db.commit()
        db.refresh(delay_log)
        return delay_log
