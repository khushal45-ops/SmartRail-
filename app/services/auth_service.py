from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate


class AuthService:
    @staticmethod
    def register(db: Session, user_in: UserCreate) -> User:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise ValueError("Email already registered")

        user = User(
            email=user_in.email,
            name=user_in.name,
            role=user_in.role,
            password_hash=get_password_hash(user_in.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> User | None:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def create_tokens(user: User) -> Token:
        return Token(
            access_token=create_access_token(user.id, role=user.role.value),
            refresh_token=create_refresh_token(user.id),
        )
