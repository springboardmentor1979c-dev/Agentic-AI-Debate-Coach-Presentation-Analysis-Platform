from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import (
    auth, users, arguments, fallacies, counterarguments,
    presentations, simulation, scoring, coaching, dashboards,
    notifications, exports, admin
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Agentic AI Debate Coach & Presentation Analysis Platform API"
)

# Configure CORS for local development and web app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Include API Routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(arguments.router, prefix=api_prefix)
app.include_router(fallacies.router, prefix=api_prefix)
app.include_router(counterarguments.router, prefix=api_prefix)
app.include_router(presentations.router, prefix=api_prefix)
app.include_router(simulation.router, prefix=api_prefix)
app.include_router(scoring.router, prefix=api_prefix)
app.include_router(coaching.router, prefix=api_prefix)
app.include_router(dashboards.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(exports.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }
