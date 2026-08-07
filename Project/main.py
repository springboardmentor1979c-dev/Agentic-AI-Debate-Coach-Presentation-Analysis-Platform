from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database as db
from routers import (
    auth_router,
    profile_router,
    debate_router,
    analysis_router,
    simulation_router,
    scoring_router,
    coaching_router,
    dashboard_router,
    notification_router,
    report_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database on startup."""
    db.init_db()
    yield


app = FastAPI(
    title="Agentic AI Debate Coach & Presentation Analysis Platform",
    description=(
        "AI-powered platform for debate coaching, argument analysis, "
        "logical fallacy detection, AI debate simulation, presentation analytics, "
        "performance scoring, and personalized coaching."
    ),
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(debate_router.router)
app.include_router(analysis_router.router)
app.include_router(simulation_router.router)
app.include_router(scoring_router.router)
app.include_router(coaching_router.router)
app.include_router(dashboard_router.router)
app.include_router(notification_router.router)
app.include_router(report_router.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "platform": "Debate Coach & Presentation Analysis",
        "version": "3.0.0",
        "docs": "/docs",
    }
