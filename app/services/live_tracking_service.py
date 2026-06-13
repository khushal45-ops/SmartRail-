from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.delay_log import DelayLog
from app.models.train import Train


class LiveTrackingService:
    @staticmethod
    def _route_stations(route: str) -> list[str]:
        return [station.strip().title() for station in route.split("-") if station.strip()]

    @staticmethod
    def _latest_delay_minutes(db: Session, train_id: int) -> float:
        delay_log = (
            db.query(DelayLog)
            .filter(DelayLog.train_id == train_id)
            .order_by(DelayLog.timestamp.desc())
            .first()
        )
        if not delay_log:
            return 0.0
        if delay_log.actual_delay is not None:
            return float(delay_log.actual_delay)
        return float(delay_log.predicted_delay)

    @staticmethod
    def estimate_current_location(train: Train) -> str:
        stations = LiveTrackingService._route_stations(train.route)
        if not stations:
            return train.zone
        tick = (train.id + datetime.now(timezone.utc).minute) // 10
        return stations[tick % len(stations)]

    @staticmethod
    def build_train_payload(db: Session, train: Train) -> dict:
        delay_minutes = LiveTrackingService._latest_delay_minutes(db, train.id)
        return {
            "train_id": train.id,
            "status": train.status,
            "current_location": LiveTrackingService.estimate_current_location(train),
            "delay_minutes": round(delay_minutes, 2),
            "platform": train.platform,
        }

    @staticmethod
    def get_train_status(db: Session, train_id: int) -> dict | None:
        train = db.query(Train).filter(Train.id == train_id).first()
        if not train:
            return None
        return LiveTrackingService.build_train_payload(db, train)

    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        trains = db.query(Train).all()
        active_count = 0
        delayed_count = 0
        cancelled_count = 0
        threshold = settings.delay_alert_threshold_minutes

        for train in trains:
            status = train.status.lower()
            if status == "cancelled":
                cancelled_count += 1
                continue

            delay_minutes = LiveTrackingService._latest_delay_minutes(db, train.id)
            is_delayed = status == "delayed" or delay_minutes > threshold

            if is_delayed:
                delayed_count += 1
            elif status == "active":
                active_count += 1

        return {
            "active_trains": active_count,
            "delayed_trains": delayed_count,
            "cancelled_trains": cancelled_count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
