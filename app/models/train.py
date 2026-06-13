from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Train(Base):
    __tablename__ = "trains"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    route: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    platform: Mapped[str] = mapped_column(String(20), nullable=False)
    zone: Mapped[str] = mapped_column(String(50), nullable=False)

    tickets: Mapped[list["Ticket"]] = relationship(
        "Ticket", back_populates="train", cascade="all, delete-orphan"
    )
    delay_logs: Mapped[list["DelayLog"]] = relationship(
        "DelayLog", back_populates="train", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        "Alert", back_populates="train", cascade="all, delete-orphan"
    )
