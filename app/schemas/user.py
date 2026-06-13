from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    role: UserRole = UserRole.PASSENGER


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
