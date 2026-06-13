from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DelayLog(Base):
    __tablename__ = "delay_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    train_id: Mapped[int] = mapped_column(ForeignKey("trains.id"), nullable=False, index=True)
    predicted_delay: Mapped[float] = mapped_column(Float, nullable=False)
    actual_delay: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    train: Mapped["Train"] = relationship("Train", back_populates="delay_logs")
