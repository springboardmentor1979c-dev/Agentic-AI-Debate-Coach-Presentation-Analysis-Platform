from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models

from app.routes.users import router as user_router
from app.routes.admin import router as admin_router
from app.routes.profile import router as profile_router
from app.routes.debate import router as debate_router
from app.routes.history import router as history_router
from app.routes.presentation import router as presentation_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FastAPI JWT Authentication"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(admin_router)
app.include_router(profile_router)
app.include_router(debate_router)
app.include_router(history_router)
app.include_router(presentation_router)


@app.get("/")
def home():
    return {
        "message": "FastAPI Running Successfully"
    }