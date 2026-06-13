from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    DelayTrendsResponse,
    PlatformUtilizationResponse,
    ZonePerformanceResponse,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def analytics_summary(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> AnalyticsSummaryResponse:
    return AnalyticsService.get_summary(db)


@router.get("/delay-trends", response_model=DelayTrendsResponse)
def delay_trends(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> DelayTrendsResponse:
    return AnalyticsService.get_delay_trends(db)


@router.get("/zone-performance", response_model=ZonePerformanceResponse)
def zone_performance(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> ZonePerformanceResponse:
    return AnalyticsService.get_zone_performance(db)


@router.get("/platform-utilization", response_model=PlatformUtilizationResponse)
def platform_utilization(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> PlatformUtilizationResponse:
    return AnalyticsService.get_platform_utilization(db)
