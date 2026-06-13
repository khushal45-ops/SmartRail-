from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_user
from app.core.database import get_db
from app.ml.delay_model import predict_delay
from app.ml.features import day_of_week_from_datetime, season_from_datetime
from app.schemas.delay import PredictDelayRequest, PredictDelayResponse
from app.schemas.train import TrainRead, TrainStatusUpdate
from app.core.config import settings
from app.services.delay_service import DelayService
from app.services.train_service import TrainService
from celery_worker import send_delay_alert

router = APIRouter()


@router.get("/", response_model=list[TrainRead])
def list_trains(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> list[TrainRead]:
    return TrainService.list_trains(db, skip=skip, limit=limit)


@router.get("/zone/{zone_name}", response_model=list[TrainRead])
def get_trains_by_zone(
    zone_name: str,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> list[TrainRead]:
    trains = TrainService.get_trains_by_zone(db, zone_name)
    if not trains:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No trains found in zone '{zone_name}'",
        )
    return trains


@router.post("/predict-delay", response_model=PredictDelayResponse)
def predict_train_delay(
    payload: PredictDelayRequest,
    db: Session = Depends(get_db),
) -> PredictDelayResponse:
    features = {
        "train_number": payload.train_number,
        "station_code": payload.station_code,
    }

    try:
        predicted_delay, confidence = predict_delay(features)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return PredictDelayResponse(
        predicted_delay_minutes=predicted_delay,
        confidence=confidence,
    )


@router.get("/{train_id}", response_model=TrainRead)
def get_train(
    train_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> TrainRead:
    train = TrainService.get_train(db, train_id)
    if not train:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Train {train_id} not found",
        )
    return train


@router.put("/{train_id}/status", response_model=TrainRead)
def update_train_status(
    train_id: int,
    status_in: TrainStatusUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> TrainRead:
    train = TrainService.update_status(db, train_id, status_in.status)
    if not train:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Train {train_id} not found",
        )
    return train
