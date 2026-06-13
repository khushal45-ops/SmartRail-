from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.delay_log import DelayLog
from app.models.enums import TicketStatus
from app.models.ticket import Ticket
from app.models.train import Train

DELAY_THRESHOLD_MINUTES = 60
DEFAULT_SEAT_CAPACITY = 72


@dataclass
class ReallocationCheck:
    pnr: str
    eligible: bool
    ticket_id: int
    current_train_id: int
    delay_minutes: float
    threshold_minutes: int
    message: str


@dataclass
class AlternativeTrain:
    train_id: int
    train_number: str
    name: str
    route: str
    status: str
    platform: str
    available_seats: int
    estimated_delay_minutes: float


@dataclass
class MultihopLeg:
    train_id: int
    train_number: str
    route: str
    from_station: str
    to_station: str


@dataclass
class MultihopRoute:
    source: str
    destination: str
    legs: list[MultihopLeg]
    total_legs: int


class TicketService:
    @staticmethod
    def _parse_route(route: str) -> tuple[str, str]:
        parts = [part.strip().lower() for part in route.split("-") if part.strip()]
        if len(parts) < 2:
            station = parts[0] if parts else route.lower()
            return station, station
        return parts[0], parts[-1]

    @staticmethod
    def _get_ticket_by_pnr(db: Session, pnr: str) -> Ticket | None:
        return (
            db.query(Ticket)
            .options(joinedload(Ticket.train))
            .filter(Ticket.pnr == pnr)
            .first()
        )

    @staticmethod
    def _latest_delay_minutes(db: Session, train_id: int) -> float:
        delay_log = (
            db.query(DelayLog)
            .filter(DelayLog.train_id == train_id)
            .order_by(DelayLog.timestamp.desc())
            .first()
        )
        if not delay_log:
            return 0.0
        if delay_log.actual_delay is not None:
            return float(delay_log.actual_delay)
        return float(delay_log.predicted_delay)

    @staticmethod
    def _occupied_seats(db: Session, train_id: int) -> int:
        return (
            db.query(func.count(Ticket.id))
            .filter(
                Ticket.train_id == train_id,
                Ticket.status == TicketStatus.ACTIVE,
            )
            .scalar()
            or 0
        )

    @staticmethod
    def check_reallocation(db: Session, pnr: str) -> ReallocationCheck:
        ticket = TicketService._get_ticket_by_pnr(db, pnr)
        if not ticket:
            raise ValueError(f"Ticket with PNR '{pnr}' not found")
        if ticket.status != TicketStatus.ACTIVE:
            raise ValueError(f"Ticket '{pnr}' is not active (status: {ticket.status.value})")

        delay_minutes = TicketService._latest_delay_minutes(db, ticket.train_id)
        eligible = delay_minutes > DELAY_THRESHOLD_MINUTES
        message = (
            f"Train delayed by {delay_minutes:.0f} mins — reallocation available"
            if eligible
            else f"Delay ({delay_minutes:.0f} mins) is within {DELAY_THRESHOLD_MINUTES} min threshold"
        )

        return ReallocationCheck(
            pnr=pnr,
            eligible=eligible,
            ticket_id=ticket.id,
            current_train_id=ticket.train_id,
            delay_minutes=delay_minutes,
            threshold_minutes=DELAY_THRESHOLD_MINUTES,
            message=message,
        )

    @staticmethod
    def find_alternative_trains(
        db: Session,
        route: str,
        departure_time: datetime,
        exclude_train_id: int | None = None,
    ) -> list[AlternativeTrain]:
        source, destination = TicketService._parse_route(route)
        trains = (
            db.query(Train)
            .filter(Train.status == "active")
            .all()
        )

        alternatives: list[AlternativeTrain] = []
        for train in trains:
            if exclude_train_id and train.id == exclude_train_id:
                continue

            train_source, train_destination = TicketService._parse_route(train.route)
            same_route = train.route.lower() == route.lower()
            same_corridor = train_source == source and train_destination == destination
            if not (same_route or same_corridor):
                continue

            delay_minutes = TicketService._latest_delay_minutes(db, train.id)
            if delay_minutes > DELAY_THRESHOLD_MINUTES:
                continue

            occupied = TicketService._occupied_seats(db, train.id)
            available_seats = max(0, DEFAULT_SEAT_CAPACITY - occupied)
            if available_seats <= 0:
                continue

            alternatives.append(
                AlternativeTrain(
                    train_id=train.id,
                    train_number=train.number,
                    name=train.name,
                    route=train.route,
                    status=train.status,
                    platform=train.platform,
                    available_seats=available_seats,
                    estimated_delay_minutes=delay_minutes,
                )
            )

        alternatives.sort(
            key=lambda item: (
                item.estimated_delay_minutes,
                abs(hash(item.train_number + departure_time.isoformat())) % 100,
            )
        )
        return alternatives

    @staticmethod
    def find_multihop_route(
        db: Session,
        source: str,
        destination: str,
    ) -> list[MultihopRoute]:
        source_key = source.strip().lower()
        destination_key = destination.strip().lower()
        if source_key == destination_key:
            return []

        trains = db.query(Train).filter(Train.status == "active").all()
        adjacency: dict[str, list[tuple[str, Train]]] = defaultdict(list)

        for train in trains:
            train_source, train_destination = TicketService._parse_route(train.route)
            adjacency[train_source].append((train_destination, train))

        suggestions: list[MultihopRoute] = []
        seen: set[tuple[int, ...]] = set()

        for intermediate, first_train in adjacency.get(source_key, []):
            if intermediate == destination_key:
                continue
            for final_station, second_train in adjacency.get(intermediate, []):
                if final_station != destination_key:
                    continue

                leg_ids = (first_train.id, second_train.id)
                if leg_ids in seen:
                    continue
                seen.add(leg_ids)

                first_source, first_dest = TicketService._parse_route(first_train.route)
                second_source, second_dest = TicketService._parse_route(second_train.route)
                suggestions.append(
                    MultihopRoute(
                        source=source_key,
                        destination=destination_key,
                        legs=[
                            MultihopLeg(
                                train_id=first_train.id,
                                train_number=first_train.number,
                                route=first_train.route,
                                from_station=first_source,
                                to_station=first_dest,
                            ),
                            MultihopLeg(
                                train_id=second_train.id,
                                train_number=second_train.number,
                                route=second_train.route,
                                from_station=second_source,
                                to_station=second_dest,
                            ),
                        ],
                        total_legs=2,
                    )
                )

        return suggestions

    @staticmethod
    def reallocate_ticket(db: Session, pnr: str, new_train_id: int) -> Ticket:
        ticket = TicketService._get_ticket_by_pnr(db, pnr)
        if not ticket:
            raise ValueError(f"Ticket with PNR '{pnr}' not found")
        if ticket.status != TicketStatus.ACTIVE:
            raise ValueError(f"Ticket '{pnr}' cannot be reallocated (status: {ticket.status.value})")

        new_train = db.query(Train).filter(Train.id == new_train_id).first()
        if not new_train:
            raise ValueError(f"Train {new_train_id} not found")
        if new_train.status != "active":
            raise ValueError(f"Train {new_train_id} is not active")

        occupied = TicketService._occupied_seats(db, new_train_id)
        if occupied >= DEFAULT_SEAT_CAPACITY:
            raise ValueError(f"Train {new_train_id} has no available seats")

        ticket.train_id = new_train_id
        ticket.status = TicketStatus.REALLOCATED
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def process_reallocation(
        db: Session,
        pnr: str,
        new_train_id: int,
        departure_time: datetime | None = None,
    ) -> dict:
        check = TicketService.check_reallocation(db, pnr)
        if not check.eligible:
            raise ValueError(check.message)

        ticket = TicketService._get_ticket_by_pnr(db, pnr)
        if not ticket or not ticket.train:
            raise ValueError(f"Ticket with PNR '{pnr}' not found")

        reference_time = departure_time or datetime.now()
        route = ticket.train.route
        source, destination = TicketService._parse_route(route)

        alternatives = TicketService.find_alternative_trains(
            db,
            route=route,
            departure_time=reference_time,
            exclude_train_id=ticket.train_id,
        )
        multihop_routes = TicketService.find_multihop_route(db, source, destination)

        valid_train_ids = {alt.train_id for alt in alternatives}
        if new_train_id not in valid_train_ids:
            raise ValueError(
                f"Train {new_train_id} is not an eligible alternative for this route"
            )

        updated_ticket = TicketService.reallocate_ticket(db, pnr, new_train_id)

        return {
            "check": check,
            "ticket": updated_ticket,
            "alternatives_considered": alternatives,
            "multihop_options": multihop_routes,
        }
