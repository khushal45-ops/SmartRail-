from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.middleware.route_policy import is_public_route, requires_admin
from app.core.security import decode_token
from app.models.enums import UserRole


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """Validate JWT and enforce role-based access on protected API routes."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path
        method = request.method

        if is_public_route(method, path):
            return await call_next(request)

        if not path.startswith("/api"):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = auth_header.removeprefix("Bearer ").strip()
        try:
            payload = decode_token(token)
        except ValueError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        if payload.get("type") != "access":
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token type"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        role = payload.get("role")
        user_id = payload.get("sub")
        if not user_id or not role:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token payload"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        request.state.user_id = int(user_id)
        request.state.role = role

        if requires_admin(method, path) and role != UserRole.ADMIN.value:
            return JSONResponse(
                status_code=403,
                content={"detail": "Admin privileges required"},
            )

        return await call_next(request)
