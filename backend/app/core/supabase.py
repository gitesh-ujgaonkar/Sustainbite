"""
supabase.py — Supabase Client Singleton

Provides a pre-configured Supabase client for server-side operations.
Uses the SERVICE_ROLE key to bypass RLS for admin queries.
"""

from supabase import create_client, Client

from app.core.config import settings

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """
    Return a singleton Supabase client.

    Uses SUPABASE_SERVICE_KEY (not anon key) so the backend can
    bypass Row Level Security for admin operations and cross-table queries.
    """
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env. "
                "Get the service_role key from Supabase Dashboard > Settings > API."
            )
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY,
        )
    return _supabase_client
