from dataclasses import dataclass


@dataclass(frozen=True)
class RouteRule:
    methods: frozenset[str]
    path: str


PUBLIC_PATHS: frozenset[str] = frozenset(
    {
        "/",
        "/docs",
        "/redoc",
        "/openapi.json",
    }
)

PUBLIC_ROUTES: tuple[RouteRule, ...] = (
    RouteRule(methods=frozenset({"POST"}), path="/api/auth/register"),
    RouteRule(methods=frozenset({"POST"}), path="/api/auth/login"),
    RouteRule(methods=frozenset({"GET"}), path="/api/v1/health"),
    RouteRule(methods=frozenset({"POST"}), path="/api/trains/predict-delay"),
)

ADMIN_ROUTES: tuple[RouteRule, ...] = ()

ADMIN_PATH_SUFFIXES: tuple[tuple[str, str], ...] = (
    ("PUT", "/status"),
)


def normalize_path(path: str) -> str:
    if path != "/" and path.endswith("/"):
        return path.rstrip("/")
    return path


def is_public_route(method: str, path: str) -> bool:
    normalized = normalize_path(path)
    if normalized in PUBLIC_PATHS:
        return True
    upper_method = method.upper()
    return any(
        upper_method in rule.methods and normalized == rule.path for rule in PUBLIC_ROUTES
    )


def requires_admin(method: str, path: str) -> bool:
    normalized = normalize_path(path)
    upper_method = method.upper()
    if any(
        upper_method in rule.methods and normalized == rule.path for rule in ADMIN_ROUTES
    ):
        return True

    if normalized.startswith("/api/trains/"):
        return any(
            upper_method == rule_method and normalized.endswith(suffix)
            for rule_method, suffix in ADMIN_PATH_SUFFIXES
        )

    return False
