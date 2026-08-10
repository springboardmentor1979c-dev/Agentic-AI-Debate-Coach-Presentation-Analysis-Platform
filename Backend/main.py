from fastapi.middleware.cors import CORSMiddleware
from report_generator import generate_report
from fastapi.responses import FileResponse
import os
import shutil
from presentation_utils import extract_ppt_text, extract_pdf_text
from fastapi import UploadFile, File
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
import models as models
import schemas as schemas
import auth as auth
from models import *
from pydantic import BaseModel

# Create database tables
Base.metadata.create_all(bind=engine)

class DebateRequest(BaseModel):
    topic: str
    argument: str

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
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):

    debates = db.query(Debate).filter(
        Debate.user_email == current_user["sub"]
    ).all()

    return debates

@app.post(
    "/debates",
    tags=["Debate"],
    summary="Submit a debate"
)
def submit_debate(
    debate: DebateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):

    new_debate = Debate(
        topic=debate.topic,
        argument=debate.argument,
        user_email=current_user["sub"]
    )

    db.add(new_debate)
    db.commit()
    db.refresh(new_debate)

    # ---------------- Argument Analysis ----------------

    argument = debate.argument.lower()

    clarity = 80
    evidence = 60
    logic = 70
    persuasiveness = 75

    evidence_words = [
        "because",
        "research",
        "study",
        "statistics",
        "data",
        "example",
        "according"
    ]

    for word in evidence_words:
        if word in argument:
            evidence += 5

    persuasive_words = [
        "should",
        "must",
        "important",
        "necessary",
        "beneficial"
    ]

    for word in persuasive_words:
        if word in argument:
            persuasiveness += 3

    overall_score = (clarity + evidence + logic + persuasiveness) // 4

    # ---------------- Logical Fallacy ----------------

    logical_fallacy = "None Detected"

    if "everyone" in argument:
        logical_fallacy = "Bandwagon Fallacy"

    elif "always" in argument or "never" in argument:
        logical_fallacy = "Hasty Generalization"

    elif "idiot" in argument or "stupid" in argument:
        logical_fallacy = "Ad Hominem"

    elif "if" in argument and "then" in argument:
        logical_fallacy = "Slippery Slope"

            # ---------------- Counter Argument ----------------

    counter_argument = "Consider the opposite viewpoint."

    if "ai" in argument:
        counter_argument = (
            "AI is a powerful tool, but it cannot completely replace "
            "human creativity, empathy, and real-world experience."
        )

    elif "education" in argument:
        counter_argument = (
            "Traditional teaching methods still provide social interaction "
            "and emotional support that technology cannot fully replace."
        )

    elif "technology" in argument:
        counter_argument = (
            "Technology improves efficiency, but overdependence may reduce "
            "critical thinking and interpersonal skills."
        )

    elif "online" in argument:
        counter_argument = (
            "Offline learning encourages better collaboration and practical "
            "experience in many situations."
        )

            # ---------------- Recommendation Engine ----------------

    suggestion = "Excellent argument. Keep practicing."

    if evidence < 70:
        suggestion = (
            "Support your argument with statistics, research papers, "
            "or real-world examples."
        )

    elif persuasiveness < 80:
        suggestion = (
            "Use stronger persuasive words like 'must', 'essential', "
            "'significantly', or 'critical'."
        )

    elif logical_fallacy != "None Detected":
        suggestion = (
            "Avoid logical fallacies by supporting your claims with "
            "facts instead of assumptions."
        )

    elif overall_score >= 85:
        suggestion = (
            "Excellent work! Try adding expert opinions to make your "
            "argument even stronger."
        )

    return {
        "message": "Debate submitted successfully!",
        "topic": debate.topic,
        "score": overall_score,
        "strengths": [
            "Clear introduction",
            "Relevant examples"
        ],
        "logical_fallacy": logical_fallacy,
        "counter_argument": counter_argument,
        "suggestion": suggestion,
    }

@app.get("/dashboard/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):

    debates = db.query(Debate).filter(
        Debate.user_email == current_user["sub"]
    ).all()

    total_debates = len(debates)

    average_score = 74

    return {
        "total_debates": total_debates,
        "average_score": average_score,
        "presentations_uploaded": 1
    }

@app.post("/download-report")
def download_report(
    debate: DebateRequest,
    current_user: dict = Depends(auth.get_current_user)
):

    report_data = {
        "topic": debate.topic,
        "score": 74,
        "logical_fallacy": "None Detected",
        "counter_argument": "Consider the opposite viewpoint.",
        "suggestion": "Support your argument with evidence."
    }

    filename = "AI_Debate_Report.pdf"

    generate_report(report_data, filename)

    return FileResponse(
        path=filename,
        filename=filename,
        media_type="application/pdf"
    )

@app.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)):

    debates = db.query(Debate).all()

    leaderboard = []

    for debate in debates:

        leaderboard.append({

            "user": debate.user_email,

            "score": 74

        })

    leaderboard.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return leaderboard

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

@app.post("/presentation/upload")
async def upload_presentation(
    file: UploadFile = File(...),
    current_user: dict = Depends(auth.get_current_user)
):

    upload_dir = "./uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if file.filename.endswith(".pptx"):
        extracted_text = extract_ppt_text(file_path)

    elif file.filename.endswith(".pdf"):
        extracted_text = extract_pdf_text(file_path)

    else:
        raise HTTPException(
            status_code=400,
            detail="Only PPTX and PDF files are supported."
        )

    return {
        "message": "Presentation uploaded successfully!",
        "filename": file.filename,
        "uploaded_by": current_user["sub"],
        "preview": extracted_text[:500]
    }