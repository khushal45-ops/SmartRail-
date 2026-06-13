from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.delay_log import DelayLog
from app.models.enums import TicketStatus
from app.models.ticket import Ticket
from app.models.train import Train
from app.services.live_tracking_service import LiveTrackingService


class AnalyticsService:
    @staticmethod
    def _delay_value():
        return func.coalesce(DelayLog.actual_delay, DelayLog.predicted_delay)

    @staticmethod
    def get_summary(db: Session) -> dict:
        stats = LiveTrackingService.get_dashboard_stats(db)
        total_trains = db.query(func.count(Train.id)).scalar() or 0
        return {
            "active_trains": stats["active_trains"],
            "delayed_trains": stats["delayed_trains"],
            "cancelled_trains": stats["cancelled_trains"],
            "total_trains": total_trains,
            "timestamp": stats["timestamp"],
        }

    @staticmethod
    def get_delay_trends(db: Session, days: int = 7) -> dict:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        delay_value = AnalyticsService._delay_value()
        day_bucket = func.date(DelayLog.timestamp)

        rows = (
            db.query(
                day_bucket.label("day"),
                func.avg(delay_value).label("avg_delay_minutes"),
                func.count(DelayLog.id).label("log_count"),
            )
            .filter(DelayLog.timestamp >= start_date)
            .group_by(day_bucket)
            .order_by(day_bucket)
            .all()
        )

        trends = [
            {
                "date": row.day.isoformat() if hasattr(row.day, "isoformat") else str(row.day),
                "avg_delay_minutes": round(float(row.avg_delay_minutes or 0), 2),
                "log_count": int(row.log_count),
            }
            for row in rows
        ]

        return {
            "period_days": days,
            "trends": trends,
        }

    @staticmethod
    def get_zone_performance(db: Session) -> dict:
        threshold = settings.delay_alert_threshold_minutes
        trains = db.query(Train).all()
        zone_stats: dict[str, dict[str, int]] = {}

        for train in trains:
            zone = train.zone
            if zone not in zone_stats:
                zone_stats[zone] = {"total": 0, "on_time": 0, "delayed": 0, "cancelled": 0}

            zone_stats[zone]["total"] += 1
            status = train.status.lower()

            if status == "cancelled":
                zone_stats[zone]["cancelled"] += 1
                continue

            delay_minutes = LiveTrackingService._latest_delay_minutes(db, train.id)
            is_delayed = status == "delayed" or delay_minutes > threshold

            if is_delayed:
                zone_stats[zone]["delayed"] += 1
            else:
                zone_stats[zone]["on_time"] += 1

        zones = []
        for zone, counts in zone_stats.items():
            operational = counts["on_time"] + counts["delayed"]
            on_time_pct = round((counts["on_time"] / operational) * 100, 2) if operational else 0.0
            zones.append(
                {
                    "zone": zone,
                    "total_trains": counts["total"],
                    "on_time_trains": counts["on_time"],
                    "delayed_trains": counts["delayed"],
                    "cancelled_trains": counts["cancelled"],
                    "on_time_percentage": on_time_pct,
                }
            )

        zones.sort(key=lambda item: item["on_time_percentage"], reverse=True)
        best_zone = zones[0] if zones else None
        worst_zone = zones[-1] if zones else None

        return {
            "best_zone": best_zone,
            "worst_zone": worst_zone,
            "zones": zones,
        }

    @staticmethod
    def get_platform_utilization(db: Session) -> dict:
        train_counts = dict(
            db.query(Train.platform, func.count(Train.id))
            .group_by(Train.platform)
            .all()
        )
        ticket_counts = dict(
            db.query(Train.platform, func.count(Ticket.id))
            .join(Ticket, Ticket.train_id == Train.id)
            .filter(Ticket.status == TicketStatus.ACTIVE)
            .group_by(Train.platform)
            .all()
        )

        all_platforms = set(train_counts) | set(ticket_counts)
        platforms = []
        for platform in all_platforms:
            train_count = int(train_counts.get(platform, 0))
            active_ticket_count = int(ticket_counts.get(platform, 0))
            platforms.append(
                {
                    "platform": platform,
                    "train_count": train_count,
                    "active_ticket_count": active_ticket_count,
                    "utilization_score": train_count + active_ticket_count,
                }
            )

        platforms.sort(key=lambda item: item["utilization_score"], reverse=True)
        busiest = platforms[0] if platforms else None

        return {
            "busiest_platform": busiest,
            "platforms": platforms,
        }
