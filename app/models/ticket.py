from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import TicketStatus


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    pnr: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    train_id: Mapped[int] = mapped_column(ForeignKey("trains.id"), nullable=False, index=True)
    seat_number: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus, name="ticket_status", native_enum=False),
        default=TicketStatus.ACTIVE,
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="tickets")
    train: Mapped["Train"] = relationship("Train", back_populates="tickets")
