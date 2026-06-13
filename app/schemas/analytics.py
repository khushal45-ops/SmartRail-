from typing import Any

from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    active_trains: int
    delayed_trains: int
    cancelled_trains: int
    total_trains: int
    timestamp: str


class DelayTrendPoint(BaseModel):
    date: str
    avg_delay_minutes: float
    log_count: int


class DelayTrendsResponse(BaseModel):
    period_days: int
    trends: list[DelayTrendPoint]


class ZonePerformanceResponse(BaseModel):
    best_zone: dict[str, Any] | None
    worst_zone: dict[str, Any] | None
    zones: list[dict[str, Any]]


class PlatformUtilizationResponse(BaseModel):
    busiest_platform: dict[str, Any] | None
    platforms: list[dict[str, Any]]
