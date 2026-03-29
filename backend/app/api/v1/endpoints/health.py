"""
health.py — Health Check Endpoints

Provides lightweight health-check routes for infrastructure monitoring,
load balancer probes, and deployment verification. Includes both a public
endpoint and a protected variant to verify JWT authentication.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import verify_supabase_token

router = APIRouter()

# ── Track server start time for uptime calculation ───────────
_startup_time = datetime.now(timezone.utc)


class HealthResponse(BaseModel):
    """Schema for the health-check response payload."""

    status: str
    service: str
    version: str
    environment: str
    timestamp: str
    uptime_seconds: float


class ProtectedHealthResponse(HealthResponse):
    """Extended health response that includes authenticated user info."""

    authenticated: bool
    user_email: str
    user_id: str


@router.get(
    "",
    response_model=HealthResponse,
    summary="Service Health Check",
    description=(
        "Returns the current health status of The Hunger Signal API. "
        "Use this endpoint for load balancer health probes, uptime "
        "monitoring, and deployment smoke tests."
    ),
)
async def health_check() -> HealthResponse:
    """
    Perform a public health check on the API service.

    Returns:
        HealthResponse with status, version, uptime, and timestamp.
    """
    now = datetime.now(timezone.utc)
    uptime = (now - _startup_time).total_seconds()

    return HealthResponse(
        status="healthy",
        service="the-hunger-signal-api",
        version=settings.VERSION,
        environment="development" if settings.DEBUG else "production",
        timestamp=now.isoformat(),
        uptime_seconds=round(uptime, 2),
    )


@router.get(
    "/protected",
    response_model=ProtectedHealthResponse,
    summary="Protected Health Check (Auth Required)",
    description=(
        "Same as the public health check, but requires a valid Supabase "
        "JWT in the Authorization header. Returns 401 if unauthenticated. "
        "Use this to verify the auth flow works end-to-end."
    ),
)
async def protected_health_check(
    current_user: dict = Depends(verify_supabase_token),
) -> ProtectedHealthResponse:
    """
    Protected health check — proves JWT verification works.

    Requires: Authorization: Bearer <supabase_access_token>

    Returns:
        ProtectedHealthResponse with user email and auth status.
    """
    now = datetime.now(timezone.utc)
    uptime = (now - _startup_time).total_seconds()

    return ProtectedHealthResponse(
        status="healthy",
        service="the-hunger-signal-api",
        version=settings.VERSION,
        environment="development" if settings.DEBUG else "production",
        timestamp=now.isoformat(),
        uptime_seconds=round(uptime, 2),
        authenticated=True,
        user_email=current_user["email"],
        user_id=current_user["auth_id"],
    )

