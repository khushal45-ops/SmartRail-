"""
Railway Management System API entrypoint.

Loads environment variables, registers routers, applies JWT + CORS middleware,
and exposes WebSocket live-tracking endpoints.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.chatbot import router as chatbot_router
from app.api.tickets import router as tickets_router
from app.api.trains import router as trains_router
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.middleware import JWTAuthMiddleware
from app.models import Alert, DelayLog, Ticket, Train, User  # noqa: F401
from app.services.live_tracking_service import LiveTrackingService

logger = logging.getLogger(__name__)

WS_POLL_INTERVAL_SECONDS = 10


def register_routers(application: FastAPI) -> None:
    """Mount all API routers with their URL prefixes."""
    application.include_router(auth_router, prefix="/api/auth", tags=["auth"])
    application.include_router(trains_router, prefix="/api/trains", tags=["trains"])
    application.include_router(tickets_router, prefix="/api/tickets", tags=["tickets"])
    application.include_router(chatbot_router, prefix="/api/chat", tags=["chat"])
    application.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
    application.include_router(api_router, prefix=settings.api_v1_prefix, tags=["v1"])


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready")
    logger.info("Celery broker: %s", settings.celery_broker_url)
    logger.info("CORS origins: %s", settings.cors_origins)
    yield


app = FastAPI(
    title="SmartRail API",
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)

# JWT runs on all /api/* routes (public routes exempted in route_policy).
# CORS is added last so it wraps JWT and handles preflight for the React app.
app.add_middleware(JWTAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routers(app)


@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "message": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "endpoints": {
            "health": f"{settings.api_v1_prefix}/health",
            "auth": "/api/auth",
            "trains": "/api/trains",
            "tickets": "/api/tickets",
            "chat": "/api/chat",
            "analytics": "/api/analytics",
            "websockets": {
                "train": "/ws/train/{train_id}",
                "dashboard": "/ws/dashboard",
            },
        },
    }


@app.websocket("/ws/train/{train_id}")
async def train_status_ws(websocket: WebSocket, train_id: int) -> None:
    await websocket.accept()
    try:
        while True:
            db = SessionLocal()
            try:
                payload = LiveTrackingService.get_train_status(db, train_id)
            finally:
                db.close()

            if payload is None:
                await websocket.send_json({"error": f"Train {train_id} not found"})
                await websocket.close(code=1008)
                return

            await websocket.send_json(payload)
            await asyncio.sleep(WS_POLL_INTERVAL_SECONDS)
    except WebSocketDisconnect:
        return


@app.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            db = SessionLocal()
            try:
                stats = LiveTrackingService.get_dashboard_stats(db)
            finally:
                db.close()

            await websocket.send_json(stats)
            await asyncio.sleep(WS_POLL_INTERVAL_SECONDS)
    except WebSocketDisconnect:
        return
