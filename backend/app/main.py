import os
from pathlib import Path
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.core.config import settings
from backend.app.database.db import engine, Base
from backend.app.api.auth import router as auth_router
from backend.app.api.profile import router as profile_router
from backend.app.api.debates import router as debates_router
from backend.app.api.roles import router as roles_router
from backend.app.api.analysis import router as analysis_router
from backend.app.api.debate import router as debate_router
from backend.app.api.presentation import router as presentation_router
from backend.app.middlewares.exception_handler import ExceptionHandlerMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("debate_coach_api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Week 2, 3, & 4 API for Agentic AI Debate Coach & Presentation Analysis Platform",
    version="1.0.0"
)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handling middleware
app.add_middleware(ExceptionHandlerMiddleware)

# Static mounting for uploads and reports
os.makedirs("./static/uploads", exist_ok=True)
os.makedirs("./static/reports", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="./static/uploads"), name="uploads")
app.mount("/reports", StaticFiles(directory="./static/reports"), name="reports")

# Database Table Creation on Startup (for rapid dev and SQLite fallback testing)
@app.on_event("startup")
def on_startup():
    try:
        logger.info("Initializing database tables if not existing...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")

# Include API Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(debates_router)
app.include_router(roles_router)
app.include_router(analysis_router)
app.include_router(debate_router)
app.include_router(presentation_router)

# Mount Frontend static files in production if dist exists
frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")
    @app.get("/")
    def serve_frontend():
        return FileResponse(frontend_dir / "index.html")
else:
    @app.get("/")
    def root_endpoint():
        return {
            "message": "Welcome to the Agentic AI Debate Coach API. Frontend build is not found. Run dev server in frontend folder."
        }
