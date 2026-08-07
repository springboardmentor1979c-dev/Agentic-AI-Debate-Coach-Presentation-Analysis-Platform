from fastapi import FastAPI

from routers import auth_router, profile_router

app = FastAPI(
    title="Debate Coach & Presentation Analysis",
    description="JWT login, RBAC (Learner / Coach / Educator / Admin), User Profiles",
    version="2.0.0",
)

app.include_router(auth_router.router)
app.include_router(profile_router.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok"}
