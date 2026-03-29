"""
schemas.py — Pydantic Request & Response Models

Defines all data transfer objects (DTOs) for API request validation
and response serialization. Organized by domain.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ── Volunteer Schemas ────────────────────────────────────────

ApprovalStatus = Literal["PENDING", "APPROVED", "REJECTED", "BANNED"]


class VolunteerStatusUpdate(BaseModel):
    """Request body for updating a volunteer's approval status."""
    status: ApprovalStatus = Field(
        ...,
        description="New approval status for the volunteer.",
        examples=["APPROVED"],
    )
    reason: str | None = Field(
        None,
        description="Optional reason for the status change (shown to volunteer).",
        max_length=500,
    )


class VolunteerResponse(BaseModel):
    """Response model for a volunteer record."""
    id: str
    name: str | None = None
    phone: str | None = None
    is_available: bool = False
    green_points: int = 0
    approval_status: str = "PENDING"
    id_document_url: str | None = None
    created_at: str | None = None


class PendingVolunteerResponse(BaseModel):
    """Response for listing pending volunteer verifications."""
    volunteers: list[VolunteerResponse]
    total_count: int


# ── Admin Dashboard Schemas ──────────────────────────────────

class AggregateStats(BaseModel):
    """Aggregate platform statistics for admin dashboard."""
    total_kg_donated_all_time: float = Field(
        ..., description="Sum of all quantity_kg from delivered orders."
    )
    total_kg_delivered_today: float = Field(
        ..., description="Sum of quantity_kg delivered in the last 24 hours."
    )
    active_volunteers_count: int = Field(
        ..., description="Volunteers with is_available = true and APPROVED status."
    )
    total_restaurants: int = 0
    total_ngos: int = 0
    total_volunteers: int = 0
    pending_verifications: int = 0


class ActivityFeedItem(BaseModel):
    """A single row in the admin activity feed."""
    delivery_id: str
    restaurant_name: str | None = None
    ngo_name: str | None = None
    volunteer_name: str | None = None
    food_type: str | None = None
    quantity_kg: float
    status: str
    created_at: str | None = None
    updated_at: str | None = None


class ActivityFeedResponse(BaseModel):
    """Paginated activity feed response."""
    items: list[ActivityFeedItem]
    total_count: int


# ── Volunteer Upload Schemas ─────────────────────────────────

class UploadResponse(BaseModel):
    """Response after successful ID upload."""
    message: str
    document_url: str
    volunteer_id: str
