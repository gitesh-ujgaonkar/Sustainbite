from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import verify_supabase_token
from app.core.supabase import get_supabase_client

router = APIRouter()

@router.get("/restaurants/me", summary="Get Restaurant Gamification Stats")
async def get_restaurant_stats(current_user: dict = Depends(verify_supabase_token)):
    supabase = get_supabase_client()
    user_id = current_user["auth_id"]
    
    # 1. Fetch Profile Points
    profile = supabase.table("restaurants").select("green_points").eq("id", user_id).execute()
    total_points = profile.data[0].get("green_points", 0) if profile.data else 0

    # 2. Fetch Delivered Donations for this Restaurant
    deliveries = (
        supabase.table("deliveries")
        .select("quantity_kg")
        .eq("restaurant_id", user_id)
        .eq("status", "DELIVERED")
        .execute()
    )
    
    total_deliveries = len(deliveries.data) if deliveries.data else 0
    total_kg = sum(float(d.get("quantity_kg", 0)) for d in deliveries.data) if deliveries.data else 0
    
    return {
        "total_points": total_points,
        "total_deliveries": total_deliveries,
        "total_kg": total_kg
    }


@router.get("/volunteers/me", summary="Get Volunteer Gamification Stats")
async def get_volunteer_stats(current_user: dict = Depends(verify_supabase_token)):
    supabase = get_supabase_client()
    user_id = current_user["auth_id"]
    
    # 1. Fetch Profile Points
    profile = supabase.table("volunteers").select("green_points").eq("id", user_id).execute()
    total_points = profile.data[0].get("green_points", 0) if profile.data else 0

    # 2. Fetch Delivered Donations completed by this Volunteer
    deliveries = (
        supabase.table("deliveries")
        .select("quantity_kg")
        .eq("volunteer_id", user_id)
        .eq("status", "DELIVERED")
        .execute()
    )
    
    total_deliveries = len(deliveries.data) if deliveries.data else 0
    total_kg = sum(float(d.get("quantity_kg", 0)) for d in deliveries.data) if deliveries.data else 0
    
    return {
        "total_points": total_points,
        "total_deliveries": total_deliveries,
        "total_kg": total_kg
    }
