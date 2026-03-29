"""
deliveries.py — Delivery Management Endpoints

Provides endpoints for claiming and managing food deliveries.
Includes backend enforcement of volunteer approval status —
only APPROVED volunteers can claim deliveries.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import verify_supabase_token
from app.core.supabase import get_supabase_client
from app.core.email import send_otp_email
import random
import asyncio

router = APIRouter()


# ── Request/Response Models ──────────────────────────────────
class ClaimDeliveryRequest(BaseModel):
    """Request body for claiming a delivery."""
    delivery_id: str


class ClaimDeliveryResponse(BaseModel):
    """Response after successfully claiming a delivery."""
    message: str
    delivery_id: str
    volunteer_id: str
    status: str


class DeliveryStatusUpdate(BaseModel):
    """Request body for updating delivery status."""
    status: str  # 'DELIVERED'

class VerifyPickupRequest(BaseModel):
    """Request body for verifying pickup via OTP."""
    otp: str


# ── POST /deliveries/claim ───────────────────────────────────
@router.post(
    "/claim",
    response_model=ClaimDeliveryResponse,
    summary="Claim a Delivery Task",
    description=(
        "Allows an APPROVED volunteer to claim an available delivery. "
        "Rejects with 403 if volunteer is not approved. "
        "Rejects with 409 if delivery is already claimed."
    ),
)
async def claim_delivery(
    body: ClaimDeliveryRequest,
    current_user: dict = Depends(verify_supabase_token),
):
    """
    Claim a food delivery task.

    Backend Security Enforcement:
        1. Verify the user is authenticated (JWT)
        2. Look up volunteer record by auth ID
        3. Check approval_status is APPROVED — reject with 403 if not
        4. Check delivery exists and is available
        5. Assign delivery to volunteer
    """
    supabase = get_supabase_client()
    user_id = current_user["auth_id"]

    # ── Step 1: Verify volunteer exists and check approval status ──
    volunteer = (
        supabase.table("volunteers")
        .select("id, name, approval_status, is_available")
        .eq("id", user_id)
        .execute()
    )

    if not volunteer.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No volunteer profile found for this account.",
        )

    vol_record = volunteer.data[0]

    # ── Step 2: ENFORCE approval status ───────────────────────
    if vol_record["approval_status"] != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending admin verification.",
        )

    # ── Step 3: Verify delivery exists and is available ───────
    delivery = (
        supabase.table("deliveries")
        .select("id, status, volunteer_id")
        .eq("id", body.delivery_id)
        .execute()
    )

    if not delivery.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Delivery '{body.delivery_id}' not found.",
        )

    delivery_record = delivery.data[0]

    if delivery_record["status"] != "AVAILABLE":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Delivery is already '{delivery_record['status']}'. "
                "Only available deliveries can be claimed."
            ),
        )

    if delivery_record.get("volunteer_id"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This delivery has already been claimed by another volunteer.",
        )

    # ── Step 4: Generate OTP and Assign delivery ──────────────
    otp = f"{random.randint(100000, 999999)}"

    result = (
        supabase.table("deliveries")
        .update({
            "volunteer_id": user_id,
            "status": "ASSIGNED",
            "pickup_otp": otp
        })
        .eq("id", body.delivery_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to claim delivery. Please try again.",
        )

    # ── Step 5: Email the Restaurant Owner ────────────────────
    try:
        # Get restaurant owner's email. Since restaurant ID = auth user ID in our setup
        user_res = supabase.auth.admin.get_user_by_id(delivery_record["restaurant_id"])
        restaurant_email = user_res.user.email
        if restaurant_email:
            asyncio.create_task(send_otp_email(restaurant_email, vol_record["name"], otp))
    except Exception as e:
        print(f"Failed to fetch restaurant email or send OTP: {e}")

    return ClaimDeliveryResponse(
        message=f"Delivery claimed successfully by {vol_record['name']}!",
        delivery_id=body.delivery_id,
        volunteer_id=user_id,
        status="ASSIGNED",
    )

# ── POST /{delivery_id}/verify-pickup ───────────────────────
@router.post(
    "/{delivery_id}/verify-pickup",
    summary="Verify Food Pickup via OTP",
    description="Verify the 6-digit OTP provided by the restaurant to transition status from ASSIGNED to PICKED."
)
async def verify_pickup(
    delivery_id: str,
    body: VerifyPickupRequest,
    current_user: dict = Depends(verify_supabase_token),
):
    supabase = get_supabase_client()
    user_id = current_user["auth_id"]
    
    delivery = (
        supabase.table("deliveries")
        .select("id, status, volunteer_id, pickup_otp")
        .eq("id", delivery_id)
        .execute()
    )
    
    if not delivery.data:
        raise HTTPException(status_code=404, detail="Delivery not found.")
        
    delivery_record = delivery.data[0]
    
    if delivery_record["volunteer_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only verify your own deliveries.")
        
    if delivery_record["status"] != "ASSIGNED":
        raise HTTPException(status_code=400, detail="Delivery must be in ASSIGNED state to verify pickup.")
        
    if delivery_record["pickup_otp"] != body.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please check the code and try again.")
        
    result = (
        supabase.table("deliveries")
        .update({
            "status": "PICKED",
            "pickup_otp": None
        })
        .eq("id", delivery_id)
        .execute()
    )
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to verify pickup.")
        
    return {"message": "Pickup verified successfully! Status is now IN TRANSIT (PICKED)."}


# ── PATCH /deliveries/{delivery_id}/status ────────────────────
@router.patch(
    "/{delivery_id}/status",
    summary="Update Delivery Status",
    description=(
        "Update the status of an assigned delivery (e.g., to DELIVERED). "
        "Only the assigned volunteer can update the status. Note: transition to PICKED must use OTP verification."
    ),
)
async def update_delivery_status(
    delivery_id: str,
    body: DeliveryStatusUpdate,
    current_user: dict = Depends(verify_supabase_token),
):
    """Update delivery status — only the assigned volunteer can do this."""
    supabase = get_supabase_client()
    user_id = current_user["auth_id"]

    # Verify volunteer is approved
    volunteer = (
        supabase.table("volunteers")
        .select("id, approval_status")
        .eq("id", user_id)
        .execute()
    )

    if not volunteer.data or volunteer.data[0]["approval_status"] != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending admin verification.",
        )

    # Verify delivery exists and is assigned to this volunteer
    delivery = (
        supabase.table("deliveries")
        .select("id, status, volunteer_id")
        .eq("id", delivery_id)
        .execute()
    )

    if not delivery.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found.",
        )

    if delivery.data[0].get("volunteer_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update deliveries assigned to you.",
        )

    # Update status
    allowed_statuses = ["DELIVERED"]
    if body.status.upper() not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Only {', '.join(allowed_statuses)} is allowed directly. Use /verify-pickup for PICKED.",
        )

    result = (
        supabase.table("deliveries")
        .update({"status": body.status.upper()})
        .eq("id", delivery_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update delivery status.",
        )

    return {
        "message": f"Delivery status updated to {body.status.upper()}.",
        "delivery_id": delivery_id,
        "status": body.status.upper(),
    }
