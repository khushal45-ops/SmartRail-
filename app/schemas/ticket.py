from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TicketStatus


class MultihopLegRead(BaseModel):
    train_id: int
    train_number: str
    route: str
    from_station: str
    to_station: str


class MultihopRouteRead(BaseModel):
    source: str
    destination: str
    legs: list[MultihopLegRead]
    total_legs: int


class AlternativeTrainRead(BaseModel):
    train_id: int
    train_number: str
    name: str
    route: str
    status: str
    platform: str
    available_seats: int
    estimated_delay_minutes: float


class ReallocateRequest(BaseModel):
    pnr: str = Field(min_length=6, max_length=20)
    new_train_id: int = Field(gt=0)
    departure_time: datetime | None = Field(
        default=None,
        description="Optional reference departure time for alternative train ranking",
    )


class ReallocationCheckRead(BaseModel):
    pnr: str
    eligible: bool
    ticket_id: int
    current_train_id: int
    delay_minutes: float
    threshold_minutes: int
    message: str


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pnr: str
    user_id: int
    train_id: int
    seat_number: str
    status: TicketStatus


class ReallocateResponse(BaseModel):
    check: ReallocationCheckRead
    ticket: TicketRead
    alternatives_considered: list[AlternativeTrainRead]
    multihop_options: list[MultihopRouteRead]
