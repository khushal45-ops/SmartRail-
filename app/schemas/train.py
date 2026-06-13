from pydantic import BaseModel, ConfigDict, Field


class TrainBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    number: str = Field(min_length=1, max_length=20)
    route: str = Field(min_length=2, max_length=500)
    status: str = "active"
    platform: str = Field(min_length=1, max_length=20)
    zone: str = Field(min_length=1, max_length=50)


class TrainCreate(TrainBase):
    pass


class TrainRead(TrainBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class TrainStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=50)
