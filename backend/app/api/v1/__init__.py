"""
API v1 Router Aggregator

Collects all endpoint routers from the v1 API surface and
exposes them as a single router for mounting in main.py.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health

api_router = APIRouter()

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)
