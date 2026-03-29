"""
config.py — Application Configuration

Centralized configuration management using Pydantic Settings.
All values are loaded from environment variables or a .env file,
with sensible defaults for local development.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Attributes:
        PROJECT_NAME: Display name for the API and docs.
        VERSION: Semantic version string for the API.
        API_V1_PREFIX: URL prefix for all v1 API endpoints.
        DEBUG: Enable debug mode (verbose logging, auto-reload).
        SUPABASE_URL: Supabase project URL.
        SUPABASE_ANON_KEY: Supabase anonymous/public API key.
        SUPABASE_SERVICE_KEY: Supabase service_role key (bypasses RLS).
        ADMIN_EMAILS: Comma-separated fallback list of admin emails.
        CORS_ORIGINS: Comma-separated list of allowed CORS origins.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────
    PROJECT_NAME: str = "The Hunger Signal — API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # ── Supabase ─────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # ── Admin ────────────────────────────────────────────────
    ADMIN_EMAILS: str = "admin@sustainbite.com"

    # ── CORS ─────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def admin_emails_list(self) -> list[str]:
        """Parse comma-separated admin emails into a list."""
        return [email.strip().lower() for email in self.ADMIN_EMAILS.split(",") if email.strip()]


settings = Settings()

