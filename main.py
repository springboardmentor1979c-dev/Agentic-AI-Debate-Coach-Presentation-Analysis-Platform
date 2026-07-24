from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from models import Base, User, UserProfile
from database import engine, SessionLocal
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    require_role
)
from pydantic import BaseModel

class UserProfileRequest(BaseModel):
    name: str
    experience: str
    goals: str
    preferred_topics: str
class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create database session
db = SessionLocal()

# Insert sample user only if table is empty
if not db.query(User).first():
    sample_user = User(
    username="john",
    password=hash_password("1234"),
    role="Learner"
)
    db.add(sample_user)
    db.commit()

@app.get("/")
def home():
    return {"message": "Hello World"}

@app.get("/users")
def get_users():
    users = db.query(User).all()
    return users
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    if not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(
        {
            "sub": user.username,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
@app.post("/register")
def register(user: RegisterRequest):

    # Check if username already exists
    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Create new user
    new_user = User(
        username=user.username,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "username": new_user.username,
        "role": new_user.role
    }
@app.get("/dashboard")
def dashboard(current_user=Depends(verify_token)):
    return {
        "message": "Welcome to Dashboard",
        "user": current_user
    }
@app.get("/learner")
def learner_dashboard(current_user=Depends(require_role("Learner"))):
    return {
        "message": f"Welcome Learner {current_user['username']}"
    }


@app.get("/coach")
def coach_dashboard(current_user=Depends(require_role("Coach"))):
    return {
        "message": f"Welcome Coach {current_user['username']}"
    }


@app.get("/educator")
def educator_dashboard(current_user=Depends(require_role("Educator"))):
    return {
        "message": f"Welcome Educator {current_user['username']}"
    }


@app.get("/admin")
def admin_dashboard(current_user=Depends(require_role("Admin"))):
    return {
        "message": f"Welcome Admin {current_user['username']}"
    }
@app.post("/profile")
def create_profile(profile: UserProfileRequest):

    new_profile = UserProfile(
        name=profile.name,
        experience=profile.experience,
        goals=profile.goals,
        preferred_topics=profile.preferred_topics
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Profile created successfully",
        "profile": new_profile
    }
@app.put("/profile/{profile_id}")
def update_profile(profile_id: int, profile: UserProfileRequest):

    existing_profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id
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
        "message": "Profile updated successfully",
        "profile": existing_profile
    }
@app.get("/profiles")
def get_profiles():
    return db.query(UserProfile).all()