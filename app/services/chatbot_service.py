from __future__ import annotations

import re
from typing import Any

from sqlalchemy.orm import Session, joinedload

from app.models.delay_log import DelayLog
from app.models.ticket import Ticket
from app.models.train import Train
from app.services.live_tracking_service import LiveTrackingService

INTENT_KEYWORDS: dict[str, list[str]] = {
    "pnr_check": ["pnr", "booking", "reservation", "my ticket", "ticket status"],
    "delay_info": ["delay", "late", "delayed", "running late", "how late"],
    "platform_info": ["platform", "gate", "track", "which platform"],
    "complaint": ["complaint", "problem", "issue", "refund", "unhappy", "bad service", "terrible"],
    "train_status": ["train status", "where is train", "running", "status", "train"],
}


class ChatbotService:
    @staticmethod
    def classify_intent(message: str) -> str:
        text = message.lower()
        scores = {
            intent: sum(1 for keyword in keywords if keyword in text)
            for intent, keywords in INTENT_KEYWORDS.items()
        }
        best_intent = max(scores, key=scores.get)
        if scores[best_intent] == 0:
            return "train_status"
        return best_intent

    @staticmethod
    def _extract_pnr(message: str) -> str | None:
        explicit = re.search(r"\bpnr[:\s#-]*([A-Za-z0-9]{6,20})\b", message, re.IGNORECASE)
        if explicit:
            return explicit.group(1).upper()
        token_match = re.search(r"\b([A-Z]{2,4}\d{4,12})\b", message)
        if token_match:
            return token_match.group(1).upper()
        return None

    @staticmethod
    def _find_train(db: Session, message: str) -> Train | None:
        explicit = re.search(r"train\s*#?\s*(\d+)", message, re.IGNORECASE)
        if explicit:
            train = db.query(Train).filter(Train.number == explicit.group(1)).first()
            if train:
                return train

        for number in re.findall(r"\b\d{4,6}\b", message):
            train = db.query(Train).filter(Train.number == number).first()
            if train:
                return train

        name_fragment = re.search(r"train\s+([A-Za-z][A-Za-z0-9\s-]{2,40})", message, re.IGNORECASE)
        if name_fragment:
            fragment = name_fragment.group(1).strip()
            train = (
                db.query(Train)
                .filter(Train.name.ilike(f"%{fragment}%"))
                .first()
            )
            if train:
                return train

        return db.query(Train).first()

    @staticmethod
    def _latest_delay(db: Session, train_id: int) -> DelayLog | None:
        return (
            db.query(DelayLog)
            .filter(DelayLog.train_id == train_id)
            .order_by(DelayLog.timestamp.desc())
            .first()
        )

    @staticmethod
    def _handle_train_status(db: Session, message: str) -> tuple[str, dict[str, Any]]:
        train = ChatbotService._find_train(db, message)
        if not train:
            return (
                "I could not find a matching train. Please share a train number or name.",
                {},
            )

        payload = LiveTrackingService.build_train_payload(db, train)
        return (
            (
                f"Train {train.number} ({train.name}) is currently {train.status} "
                f"near {payload['current_location']} on platform {train.platform}."
            ),
            {
                "train_id": train.id,
                "train_number": train.number,
                "name": train.name,
                "route": train.route,
                "zone": train.zone,
                **payload,
            },
        )

    @staticmethod
    def _handle_pnr_check(db: Session, message: str) -> tuple[str, dict[str, Any]]:
        pnr = ChatbotService._extract_pnr(message)
        if not pnr:
            return ("Please provide your PNR number to check your booking.", {})

        ticket = (
            db.query(Ticket)
            .options(joinedload(Ticket.train))
            .filter(Ticket.pnr == pnr)
            .first()
        )
        if not ticket:
            return (f"No booking found for PNR {pnr}.", {"pnr": pnr})

        train = ticket.train
        return (
            (
                f"PNR {pnr} is {ticket.status.value} on train {train.number} ({train.name}), "
                f"seat {ticket.seat_number}, platform {train.platform}."
            ),
            {
                "pnr": ticket.pnr,
                "status": ticket.status.value,
                "seat_number": ticket.seat_number,
                "train_id": train.id,
                "train_number": train.number,
                "train_name": train.name,
                "route": train.route,
                "platform": train.platform,
            },
        )

    @staticmethod
    def _handle_delay_info(db: Session, message: str) -> tuple[str, dict[str, Any]]:
        train = ChatbotService._find_train(db, message)
        if not train:
            return (
                "Please mention a train number so I can check delay information.",
                {},
            )

        delay_log = ChatbotService._latest_delay(db, train.id)
        if not delay_log:
            return (
                f"No delay records found for train {train.number}. It appears to be on schedule.",
                {"train_id": train.id, "train_number": train.number, "delay_minutes": 0},
            )

        delay_minutes = (
            float(delay_log.actual_delay)
            if delay_log.actual_delay is not None
            else float(delay_log.predicted_delay)
        )
        return (
            f"Train {train.number} has a reported delay of {delay_minutes:.0f} minutes.",
            {
                "train_id": train.id,
                "train_number": train.number,
                "delay_minutes": round(delay_minutes, 2),
                "predicted_delay": delay_log.predicted_delay,
                "actual_delay": delay_log.actual_delay,
                "timestamp": delay_log.timestamp.isoformat(),
            },
        )

    @staticmethod
    def _handle_platform_info(db: Session, message: str) -> tuple[str, dict[str, Any]]:
        train = ChatbotService._find_train(db, message)
        if not train:
            return (
                "Please mention a train number so I can find the platform.",
                {},
            )

        return (
            f"Train {train.number} ({train.name}) is assigned to platform {train.platform}.",
            {
                "train_id": train.id,
                "train_number": train.number,
                "train_name": train.name,
                "platform": train.platform,
                "route": train.route,
                "status": train.status,
            },
        )

    @staticmethod
    def _handle_complaint(_: Session, message: str) -> tuple[str, dict[str, Any]]:
        return (
            "Sorry for the inconvenience. Your complaint has been recorded and our team will follow up shortly.",
            {"complaint_text": message.strip(), "status": "received"},
        )

    @staticmethod
    def process_message(db: Session, message: str) -> dict[str, Any]:
        intent = ChatbotService.classify_intent(message)

        handlers = {
            "train_status": ChatbotService._handle_train_status,
            "pnr_check": ChatbotService._handle_pnr_check,
            "delay_info": ChatbotService._handle_delay_info,
            "platform_info": ChatbotService._handle_platform_info,
            "complaint": ChatbotService._handle_complaint,
        }

        handler = handlers[intent]
        response_message, data = handler(db, message)

        return {
            "intent": intent,
            "message": response_message,
            "data": data,
        }
