from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
import models as models
import schemas as schemas
import auth as auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Debate Coach & Presentation Analysis Platform",
    description="Backend API for user authentication, role-based access control, and profile management.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Hello World"}


@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    # Check if username already exists
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Hash password
    hashed_password = auth.hash_password(user.password)

    # Create user
    new_user = models.User(
        username=user.username,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully",
        "role": new_user.role
    }

# Login
@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    if not user:
        raise HTTPException(status_code=404,
                            detail="User not found")

    if not auth.verify_password(
        form_data.password,
        user.password
    ):
        raise HTTPException(status_code=401,
                            detail="Invalid username or password")

    token = auth.create_access_token(
        {
            "sub": user.username,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# Create Profile
@app.post("/profile")
def create_profile(
    profile: schemas.UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):

    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admin can create profiles"
        )

    new_profile = models.UserProfile(
        name=profile.name,
        experience=profile.experience,
        goals=profile.goals,
        preferred_topics=profile.preferred_topics
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Profile Created",
        "profile": new_profile.name
    }

@app.put("/profile/{profile_id}")
def update_profile(
    profile_id: int,
    profile: schemas.UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    # Only Admin can update profiles
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admin can update profiles"
        )

    existing_profile = db.query(models.UserProfile).filter(
        models.UserProfile.id == profile_id
    ).first()

    if not existing_profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    existing_profile.name = profile.name
    existing_profile.experience = profile.experience
    existing_profile.goals = profile.goals
    existing_profile.preferred_topics = profile.preferred_topics

    db.commit()
    db.refresh(existing_profile)

    return {
        "message": "Profile Updated Successfully",
        "profile": existing_profile.name
    }

@app.get(
    "/debates",
    tags=["Debate"],
    summary="View debate sessions"
)
def view_debates(
    current_user: dict = Depends(auth.get_current_user)
):
    return {
        "message": f"Welcome {current_user['role']} {current_user['sub']}. You can access debate sessions."
    }

@app.get(
    "/coach/feedback",
    tags=["Coach"],
    summary="Review debates and provide feedback"
)
def coach_feedback(
    current_user: dict = Depends(auth.get_current_user)
):
    if current_user["role"] not in ["Coach", "Admin"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Only Coach or Admin can provide feedback."
        )

    return {
        "message": f"Welcome {current_user['sub']}. You can review debates and provide feedback."
    }

@app.get(
    "/educator/content",
    tags=["Educator"],
    summary="Manage learning content"
)
def educator_content(
    current_user: dict = Depends(auth.get_current_user)
):
    if current_user["role"] not in ["Educator", "Admin"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Only Educator or Admin can manage content."
        )

    return {
        "message": f"Welcome {current_user['sub']}. You can create and manage learning content."
    }

@app.get(
    "/admin/users",
    tags=["Admin"],
    summary="View all registered users"
)
def manage_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Only Admin can manage users."
        )

    users = db.query(models.User).all()

    return {
        "message": "User list fetched successfully",
        "users": [
            {
                "username": user.username,
                "role": user.role
            }
            for user in users
        ]
    }