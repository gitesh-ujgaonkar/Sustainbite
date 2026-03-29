"""
admin.py — Admin Dashboard API Endpoints

Provides secured endpoints for platform administrators to view
aggregate statistics, monitor activity, and manage volunteer
verification workflows.

All endpoints require valid admin JWT via the verify_admin_token dependency.
"""

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import verify_admin_token
from app.core.supabase import get_supabase_client
from app.models.schemas import (
    AggregateStats,
    ActivityFeedItem,
    ActivityFeedResponse,
    PendingVolunteerResponse,
    VolunteerResponse,
    VolunteerStatusUpdate,
)

router = APIRouter()


# ── GET /admin/stats ─────────────────────────────────────────
@router.get(
    "/stats",
    response_model=AggregateStats,
    summary="Platform Aggregate Statistics",
    description="Returns high-level platform KPIs for the admin dashboard.",
)
async def get_admin_stats(admin: dict = Depends(verify_admin_token)):
    """
    Fetches aggregate stats from Supabase:
    - Total kg donated (all time, from delivered orders)
    - Total kg delivered today
    - Active approved volunteers count
    - Total restaurants, NGOs, volunteers
    - Pending verifications count
    """
    supabase = get_supabase_client()

    # Total kg from all delivered orders
    delivered = (
        supabase.table("deliveries")
        .select("quantity_kg")
        .eq("status", "DELIVERED")
        .execute()
    )
    total_kg_all_time = sum(row["quantity_kg"] for row in (delivered.data or []))

    # Total kg delivered today (last 24 hours)
    yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    delivered_today = (
        supabase.table("deliveries")
        .select("quantity_kg")
        .eq("status", "DELIVERED")
        .gte("updated_at", yesterday)
        .execute()
    )
    total_kg_today = sum(row["quantity_kg"] for row in (delivered_today.data or []))

    # Active volunteers (available + approved)
    active_vols = (
        supabase.table("volunteers")
        .select("id", count="exact")
        .eq("is_available", True)
        .eq("approval_status", "APPROVED")
        .execute()
    )

    # Entity counts
    restaurants = supabase.table("restaurants").select("id", count="exact").execute()
    ngos = supabase.table("ngos").select("id", count="exact").execute()
    volunteers = supabase.table("volunteers").select("id", count="exact").execute()

    # Pending verifications
    pending = (
        supabase.table("volunteers")
        .select("id", count="exact")
        .eq("approval_status", "PENDING")
        .execute()
    )

    return AggregateStats(
        total_kg_donated_all_time=total_kg_all_time,
        total_kg_delivered_today=total_kg_today,
        active_volunteers_count=active_vols.count or 0,
        total_restaurants=restaurants.count or 0,
        total_ngos=ngos.count or 0,
        total_volunteers=volunteers.count or 0,
        pending_verifications=pending.count or 0,
    )


# ── GET /admin/activity-feed ────────────────────────────────
@router.get(
    "/activity-feed",
    response_model=ActivityFeedResponse,
    summary="Recent Delivery Activity Feed",
    description=(
        "Returns the most recent deliveries with joined restaurant, "
        "NGO, and volunteer names for the admin activity dashboard."
    ),
)
async def get_activity_feed(
    limit: int = 20,
    offset: int = 0,
    admin: dict = Depends(verify_admin_token),
):
    """
    Fetches recent deliveries with JOIN data from related tables.
    Uses Supabase's foreign key relationship syntax for embedded selects.
    """
    supabase = get_supabase_client()

    result = (
        supabase.table("deliveries")
        .select(
            "id, food_type, quantity_kg, status, created_at, updated_at, "
            "restaurants(name), ngos(name), volunteers(name)"
        )
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    # Get total count for pagination
    count_result = (
        supabase.table("deliveries")
        .select("id", count="exact")
        .execute()
    )

    items = []
    for row in (result.data or []):
        items.append(ActivityFeedItem(
            delivery_id=row["id"],
            restaurant_name=(row.get("restaurants") or {}).get("name"),
            ngo_name=(row.get("ngos") or {}).get("name"),
            volunteer_name=(row.get("volunteers") or {}).get("name"),
            food_type=row.get("food_type"),
            quantity_kg=row.get("quantity_kg", 0),
            status=row.get("status", ""),
            created_at=row.get("created_at"),
            updated_at=row.get("updated_at"),
        ))

    return ActivityFeedResponse(
        items=items,
        total_count=count_result.count or 0,
    )


# ── GET /admin/pending-volunteers ────────────────────────────
@router.get(
    "/pending-volunteers",
    response_model=PendingVolunteerResponse,
    summary="List Pending Volunteer Verifications",
    description="Returns all volunteers awaiting KYC approval.",
)
async def get_pending_volunteers(admin: dict = Depends(verify_admin_token)):
    """Fetch all volunteers with approval_status = PENDING."""
    supabase = get_supabase_client()

    result = (
        supabase.table("volunteers")
        .select("id, name, phone, is_available, green_points, approval_status, id_document_url, kyc_remarks, created_at")
        .eq("approval_status", "PENDING")
        .order("created_at", desc=True)
        .execute()
    )

    volunteers = [VolunteerResponse(**row) for row in (result.data or [])]

    return PendingVolunteerResponse(
        volunteers=volunteers,
        total_count=len(volunteers),
    )


# ── PATCH /admin/volunteers/{id}/status ──────────────────────
@router.patch(
    "/volunteers/{volunteer_id}/status",
    response_model=VolunteerResponse,
    summary="Update Volunteer Approval Status",
    description="Approve, reject, or ban a volunteer. Restricted to admins.",
)
async def update_volunteer_status(
    volunteer_id: str,
    body: VolunteerStatusUpdate,
    admin: dict = Depends(verify_admin_token),
):
    """
    Updates a volunteer's approval_status in the database.

    Args:
        volunteer_id: UUID of the volunteer to update.
        body: New status and optional reason.

    Returns:
        Updated volunteer record.
    """
    supabase = get_supabase_client()

    # Verify volunteer exists
    existing = (
        supabase.table("volunteers")
        .select("id, name, approval_status")
        .eq("id", volunteer_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Volunteer with ID '{volunteer_id}' not found.",
        )

    # Update status
    update_data = {"approval_status": body.status}
    if body.reason is not None:
        update_data["kyc_remarks"] = body.reason

    result = (
        supabase.table("volunteers")
        .update(update_data)
        .eq("id", volunteer_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update volunteer status.",
        )

    updated = result.data[0]
    return VolunteerResponse(
        id=updated["id"],
        name=updated.get("name"),
        phone=updated.get("phone"),
        is_available=updated.get("is_available", False),
        green_points=updated.get("green_points", 0),
        approval_status=updated.get("approval_status", "PENDING"),
        id_document_url=updated.get("id_document_url"),
        kyc_remarks=updated.get("kyc_remarks"),
        created_at=updated.get("created_at"),
    )


# ── GET /admin/volunteer-id-url/{volunteer_id} ───────────────
@router.get(
    "/volunteer-id-url/{volunteer_id}",
    response_model=dict,
    summary="Get Signed URL for Volunteer ID Document",
    description=(
        "Generates a temporary signed URL (valid for 60 seconds) "
        "to view a volunteer's uploaded identity document from the "
        "private `volunteer_ids` storage bucket. Admin-only."
    ),
)
async def get_volunteer_id_signed_url(
    volunteer_id: str,
    admin: dict = Depends(verify_admin_token),
):
    """
    Securely generate a time-limited signed URL for admin document review.

    Flow:
        1. Fetch volunteer record to get the stored `id_document_url` (storage path)
        2. Generate a 60-second signed URL via Supabase Storage
        3. Return the signed URL for temporary frontend display

    The signed URL expires after 60 seconds, preventing unauthorized
    long-term access to sensitive identity documents.
    """
    supabase = get_supabase_client()

    # Step 1: Get the volunteer's stored document path
    volunteer = (
        supabase.table("volunteers")
        .select("id, name, id_document_url, approval_status")
        .eq("id", volunteer_id)
        .execute()
    )

    if not volunteer.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Volunteer with ID '{volunteer_id}' not found.",
        )

    record = volunteer.data[0]
    storage_path = record.get("id_document_url")

    if not storage_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Volunteer '{record.get('name', volunteer_id)}' has not "
                "uploaded an identity document yet."
            ),
        )

    # Step 2: Generate signed URL (60 seconds TTL)
    SIGNED_URL_TTL_SECONDS = 60

    try:
        signed_url_response = supabase.storage.from_("volunteer_ids").create_signed_url(
            path=storage_path,
            expires_in=SIGNED_URL_TTL_SECONDS,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate signed URL: {str(e)}",
        )

    # The response structure from supabase-py
    signed_url = None
    if isinstance(signed_url_response, dict):
        signed_url = signed_url_response.get("signedURL") or signed_url_response.get("signed_url")
    elif hasattr(signed_url_response, "signed_url"):
        signed_url = signed_url_response.signed_url
    elif hasattr(signed_url_response, "signedURL"):
        signed_url = signed_url_response.signedURL

    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Signed URL generation returned an unexpected format.",
        )

    return {
        "volunteer_id": volunteer_id,
        "volunteer_name": record.get("name"),
        "approval_status": record.get("approval_status"),
        "signed_url": signed_url,
        "expires_in_seconds": SIGNED_URL_TTL_SECONDS,
    }

