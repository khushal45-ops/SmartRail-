from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.ml.delay_model import predict_delay
from app.ml.features import day_of_week_from_datetime, season_from_datetime

router = APIRouter()


class DelayPredictionRequest(BaseModel):
    train_number: str = Field(min_length=1, max_length=20)
    route: str = Field(min_length=2, max_length=500)
    weather_condition: str = Field(min_length=2, max_length=50)
    time: str = Field(description="ISO datetime string")


class DelayPredictionResponse(BaseModel):
    predicted_delay_minutes: float
    mode: str


@router.post("/predict-delay", response_model=DelayPredictionResponse)
def predict_delay_sync(
    payload: DelayPredictionRequest,
    _current_user=Depends(get_current_user),
) -> DelayPredictionResponse:
    from datetime import datetime

    reference_time = datetime.fromisoformat(payload.time)
    features = {
        "train_number": payload.train_number,
        "route": payload.route,
        "day_of_week": day_of_week_from_datetime(reference_time),
        "weather_condition": payload.weather_condition.lower(),
        "season": season_from_datetime(reference_time),
    }
    delay = predict_delay(features)
    return DelayPredictionResponse(predicted_delay_minutes=delay, mode="sync")
