"""
security.py — Generic Supabase JWT Verification

Provides a reusable dependency for authenticating ANY Supabase user
(not just admins). Use this to protect routes that require a logged-in
user without requiring admin privileges.

For admin-only routes, use verify_admin_token from dependencies.py instead.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.supabase import get_supabase_client

security = HTTPBearer()


async def verify_supabase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency: Verify any valid Supabase JWT.

    This is the generic "is this user logged in?" check.
    It does NOT check roles — any authenticated user passes.

    Flow:
        1. Extract Bearer token from Authorization header
        2. Call supabase.auth.get_user(token) to verify the JWT
        3. Return user metadata if valid

    Returns:
        dict with keys: auth_id, email, user_metadata

    Raises:
        HTTPException 401 if token is missing, expired, or invalid.
    """
    token = credentials.credentials

    try:
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "auth_id": user.id,
            "email": user.email or "",
            "user_metadata": user.user_metadata or {},
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
