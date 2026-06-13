from pydantic import BaseModel, Field
from typing import Any

class PredictDelayRequest(BaseModel):
    train_number: str
    station_code: str


class PredictDelayResponse(BaseModel):
    predicted_delay_minutes: float
    confidence: float
