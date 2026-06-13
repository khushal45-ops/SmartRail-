import enum


class UserRole(str, enum.Enum):
    PASSENGER = "passenger"
    ADMIN = "admin"


class TicketStatus(str, enum.Enum):
    ACTIVE = "active"
    REALLOCATED = "reallocated"
    CANCELLED = "cancelled"
