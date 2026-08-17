from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.database import Base, engine
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.debate import router as debate_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.dashboard import router as dashboard_router
from app.models.user import User
from app.api.ai import router as ai_router
from app.models.debate import DebateSession
from app.models.message import Message
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Agentic AI Debate Coach API",
    lifespan=lifespan
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(debate_router)
app.include_router(dashboard_router)
app.include_router(ai_router)

@app.get("/")
def home():
    return {"message": "Backend Running"}
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)