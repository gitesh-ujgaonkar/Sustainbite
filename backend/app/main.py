"""
main.py — FastAPI Application Entry Point

The Hunger Signal: AI-driven surplus food redistribution logistics platform.
Initializes the FastAPI application, configures CORS middleware, and mounts
all API version routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.v1 import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events for resource initialization
    and cleanup (e.g., database connections, ML model loading).
    """
    # ── Startup ──────────────────────────────────────────────
    print(f"🚀 Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"📡 API docs available at /docs")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    yield
    # ── Shutdown ─────────────────────────────────────────────
    print(f"🛑 Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "The Hunger Signal — An AI-driven surplus food redistribution "
        "logistics platform. Connects donors, volunteers, and NGOs to "
        "minimize food waste and maximize community impact."
    ),
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Middleware ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ─────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ── Root Redirect ───────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to API documentation."""
    return RedirectResponse(url="/docs")
