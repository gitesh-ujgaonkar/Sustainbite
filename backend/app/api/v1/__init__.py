"""
API v1 Router Aggregator

Collects all endpoint routers from the v1 API surface and
exposes them as a single router for mounting in main.py.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health, admin, volunteers, deliveries, stats

api_router = APIRouter()

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"],
)

api_router.include_router(
    volunteers.router,
    prefix="/volunteers",
    tags=["Volunteers"],
)

api_router.include_router(
    deliveries.router,
    prefix="/deliveries",
    tags=["Deliveries"],
)

api_router.include_router(
    stats.router,
    prefix="/stats",
    tags=["Statistics"],
)

