"""
volunteers.py — Volunteer API Endpoints

Provides endpoints for volunteer-specific operations:
- Confirm KYC document upload (store storage path in DB)
- Upload KYC identity document to Supabase Storage (server-side)
- Check current verification/approval status
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel

from app.core.supabase import get_supabase_client
from app.models.schemas import UploadResponse, VolunteerResponse

router = APIRouter()

# Allowed image MIME types for ID upload
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
}
MAX_FILE_SIZE_MB = 5

STORAGE_BUCKET = "volunteer_ids"


# ── Request Model ────────────────────────────────────────────
class ConfirmUploadRequest(BaseModel):
    """Request body when frontend confirms a successful storage upload."""
    volunteer_id: str
    storage_path: str


class ConfirmUploadResponse(BaseModel):
    """Response after confirming upload in the database."""
    message: str
    volunteer_id: str
    storage_path: str
    approval_status: str


# ── POST /volunteers/confirm-upload ──────────────────────────
@router.post(
    "/confirm-upload",
    response_model=ConfirmUploadResponse,
    summary="Confirm KYC Document Upload",
    description=(
        "Called by the frontend after successfully uploading a file to "
        "Supabase Storage. Saves the storage path to the volunteer's "
        "record and sets approval_status to PENDING."
    ),
)
async def confirm_upload(body: ConfirmUploadRequest):
    """
    Persist the storage path from a client-side Supabase upload.

    The frontend uploads directly to the `volunteer_ids` bucket,
    then calls this endpoint with the returned storage path.
    The backend stores the path (not a URL) so it can generate
    signed URLs on demand for admin review.
    """
    supabase = get_supabase_client()

    # Verify volunteer exists
    volunteer = (
        supabase.table("volunteers")
        .select("id, name, approval_status")
        .eq("id", body.volunteer_id)
        .execute()
    )

    if not volunteer.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Volunteer with ID '{body.volunteer_id}' not found.",
        )

    # Validate storage path looks reasonable
    if not body.storage_path or "/" not in body.storage_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid storage path. Expected format: 'volunteer_id/filename.ext'.",
        )

    # Update volunteer record with storage path
    result = (
        supabase.table("volunteers")
        .update({
            "id_document_url": body.storage_path,
            "approval_status": "PENDING",
        })
        .eq("id", body.volunteer_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update volunteer record.",
        )

    return ConfirmUploadResponse(
        message="ID document recorded successfully. Your account is under review.",
        volunteer_id=body.volunteer_id,
        storage_path=body.storage_path,
        approval_status="PENDING",
    )


# ── POST /volunteers/upload-id (Server-side upload) ──────────
@router.post(
    "/upload-id",
    response_model=UploadResponse,
    summary="Upload Volunteer ID Document (Server-Side)",
    description=(
        "Server-side upload path: receives the file via multipart form, "
        "uploads to Supabase Storage, and updates the volunteer record. "
        "Use this when the frontend cannot upload directly to Supabase."
    ),
)
async def upload_volunteer_id(
    volunteer_id: str = Form(..., description="UUID of the volunteer"),
    file: UploadFile = File(..., description="ID document (JPEG/PNG/PDF, max 5MB)"),
):
    """
    Server-side upload flow for environments without direct storage access.

    Flow:
        1. Validate file type and size
        2. Upload to Supabase Storage bucket
        3. Store the storage path (not public URL) in the volunteer record
        4. Set approval_status to PENDING
    """
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid file type '{file.content_type}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
            ),
        )

    # Read and validate file size
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({file_size_mb:.1f}MB). Maximum is {MAX_FILE_SIZE_MB}MB.",
        )

    supabase = get_supabase_client()

    # Verify volunteer exists
    volunteer = (
        supabase.table("volunteers")
        .select("id, name")
        .eq("id", volunteer_id)
        .execute()
    )

    if not volunteer.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Volunteer with ID '{volunteer_id}' not found.",
        )

    # Generate unique filename
    file_ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "jpg"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    storage_path = f"{volunteer_id}/{volunteer_id}_{timestamp}_{unique_id}.{file_ext}"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=content,
            file_options={"content-type": file.content_type},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage upload failed: {str(e)}",
        )

    # Store the STORAGE PATH (not a URL) — signed URLs generated on demand
    supabase.table("volunteers").update({
        "id_document_url": storage_path,
        "approval_status": "PENDING",
    }).eq("id", volunteer_id).execute()

    return UploadResponse(
        message="ID document uploaded successfully. Your account is under review.",
        document_url=storage_path,
        volunteer_id=volunteer_id,
    )


# ── GET /volunteers/{id}/status ──────────────────────────────
@router.get(
    "/{volunteer_id}/status",
    response_model=VolunteerResponse,
    summary="Get Volunteer Verification Status",
    description="Returns the current approval status and profile of a volunteer.",
)
async def get_volunteer_status(volunteer_id: str):
    """Fetch a volunteer's profile including their KYC approval status."""
    supabase = get_supabase_client()

    result = (
        supabase.table("volunteers")
        .select(
            "id, name, phone, is_available, green_points, "
            "approval_status, id_document_url, created_at"
        )
        .eq("id", volunteer_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Volunteer with ID '{volunteer_id}' not found.",
        )

    return VolunteerResponse(**result.data[0])
