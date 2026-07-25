from fastapi import FastAPI

from app.database import Base, engine
import app.models

from app.routes.users import router as user_router
from app.routes.admin import router as admin_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FastAPI JWT Authentication"
)

app.include_router(user_router)
app.include_router(admin_router)


@app.get("/")
def home():
    return {
        "message": "FastAPI Running Successfully"
    }


from fastapi import FastAPI

from app.database import Base, engine
import app.models

from app.routes.users import router as user_router
from app.routes.admin import router as admin_router
from app.routes.profile import router as profile_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FastAPI JWT Authentication"
)

app.include_router(user_router)
app.include_router(admin_router)
app.include_router(profile_router)


@app.get("/")
def home():
    return {
        "message": "FastAPI Running Successfully"
    }