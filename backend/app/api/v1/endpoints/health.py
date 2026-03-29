"""
health.py — Health Check Endpoint

Provides a lightweight health-check route for infrastructure monitoring,
load balancer probes, and deployment verification. Returns service metadata
including uptime and current timestamp.
"""

from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

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
    Perform a health check on the API service.

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
