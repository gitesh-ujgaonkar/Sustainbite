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


@router.get("/leaderboard", summary="Get Global Impact Leaderboard")
async def get_global_leaderboard():
    """
    Publicly accessible endpoint that securely aggregates top Gamification leaders.
    Strips all PII (email, phone, etc.) at the REST layer.
    """
    supabase = get_supabase_client()
    
    try:
        # Fetch top 10 volunteers explicitly checking strictly public metadata
        volunteers = (
            supabase.table("volunteers")
            .select("id, name, green_points")
            .order("green_points", desc=True)
            .limit(10)
            .execute()
        )
        
        # Fetch top 10 restaurants
        restaurants = (
            supabase.table("restaurants")
            .select("id, name, green_points")
            .order("green_points", desc=True)
            .limit(10)
            .execute()
        )
        
        return {
            "top_volunteers": volunteers.data if volunteers.data else [],
            "top_restaurants": restaurants.data if restaurants.data else []
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to aggregate global leaderboard: {str(e)}",
        )

