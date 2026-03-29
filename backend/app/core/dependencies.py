"""
dependencies.py — FastAPI Dependencies for Auth & RBAC

Provides reusable dependency functions for route-level
authentication and authorization checks.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.supabase import get_supabase_client

security = HTTPBearer()


async def verify_admin_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency that validates a Supabase JWT and verifies
    the user has admin privileges.

    Flow:
        1. Extract Bearer token from Authorization header
        2. Verify JWT with Supabase Auth
        3. Check if user email exists in the `admins` table
        4. Return user data if admin, else raise 403

    Returns:
        dict: The authenticated admin user's metadata.

    Raises:
        HTTPException 401: If token is missing or invalid.
        HTTPException 403: If user is not an admin.
    """
    token = credentials.credentials

    try:
        supabase = get_supabase_client()
        # Verify the JWT and get the user
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if not user or not user.email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
            )

        # Check if user email exists in admins table
        admin_check = (
            supabase.table("admins")
            .select("id, email, name")
            .eq("email", user.email)
            .execute()
        )

        if not admin_check.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required.",
            )

        return {
            "auth_id": user.id,
            "email": user.email,
            "admin_record": admin_check.data[0],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )
