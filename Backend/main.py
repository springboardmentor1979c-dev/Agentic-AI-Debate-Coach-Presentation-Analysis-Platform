from fastapi.middleware.cors import CORSMiddleware
from report_generator import generate_report
from fastapi.responses import FileResponse
import os
import shutil
from ai_engine import analyze_argument, generate_ai_response
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
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not auth.verify_password(
        form_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

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

    # ---------------- Performance Scoring ----------------

    argument_quality = 75
    evidence_usage = 60
    logical_consistency = 70
    rebuttal_effectiveness = 65
    communication_skills = 75

    # Evidence analysis
    evidence_words = [
        "because",
        "research",
        "study",
        "statistics",
        "data",
        "example",
        "according",
        "evidence",
        "report",
        "survey"
    ]

    for word in evidence_words:
        if word in argument:
            evidence_usage += 4

    evidence_usage = min(evidence_usage, 100)

    # Argument quality
    if len(argument.split()) >= 30:
        argument_quality += 8
    elif len(argument.split()) >= 15:
        argument_quality += 4

    argument_quality = min(argument_quality, 100)

    # Logical consistency
    if "therefore" in argument or "because" in argument or "however" in argument:
        logical_consistency += 8

    logical_consistency = min(logical_consistency, 100)

    # Communication skills
    if len(argument.split()) >= 20:
        communication_skills += 5

    communication_skills = min(communication_skills, 100)

    # Weighted scoring model
    overall_score = round(
        (argument_quality * 0.30) +
        (evidence_usage * 0.20) +
        (logical_consistency * 0.20) +
        (rebuttal_effectiveness * 0.15) +
        (communication_skills * 0.15)
    )

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

    if evidence_usage < 70:
        suggestion = (
            "Support your argument with statistics, research papers, "
            "or real-world examples."
        )

    elif communication_skills < 80:
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
        "performance_breakdown": {
            "argument_quality": argument_quality,
            "evidence_usage": evidence_usage,
            "logical_consistency": logical_consistency,
            "rebuttal_effectiveness": rebuttal_effectiveness,
            "communication_skills": communication_skills
        },
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

    if total_debates > 0:
        scores = []

        for debate in debates:
            argument = debate.argument.lower()

            argument_quality = 75
            evidence_usage = 60
            logical_consistency = 70
            rebuttal_effectiveness = 65
            communication_skills = 75

            evidence_words = [
                "because",
                "research",
                "study",
                "statistics",
                "data",
                "example",
                "according",
                "evidence",
                "report",
                "survey"
            ]

            for word in evidence_words:
                if word in argument:
                    evidence_usage += 4

            evidence_usage = min(evidence_usage, 100)

            if len(argument.split()) >= 30:
                argument_quality += 8
            elif len(argument.split()) >= 15:
                argument_quality += 4

            argument_quality = min(argument_quality, 100)

            if "therefore" in argument or "because" in argument or "however" in argument:
                logical_consistency += 8

            logical_consistency = min(logical_consistency, 100)

            if len(argument.split()) >= 20:
                communication_skills += 5

            communication_skills = min(communication_skills, 100)

            score = round(
                (argument_quality * 0.30) +
                (evidence_usage * 0.20) +
                (logical_consistency * 0.20) +
                (rebuttal_effectiveness * 0.15) +
                (communication_skills * 0.15)
            )

            scores.append(score)

        average_score = round(sum(scores) / len(scores))
    else:
        average_score = 0

    return {
        "total_debates": total_debates,
        "average_score": average_score,
        "presentations_uploaded": 0
    }


@app.post("/download-report")
def download_report(
    debate: DebateRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    argument = debate.argument.lower()

    # ---------------- Performance Scoring ----------------

    argument_quality = 75
    evidence_usage = 60
    logical_consistency = 70
    rebuttal_effectiveness = 65
    communication_skills = 75

    evidence_words = [
        "because",
        "research",
        "study",
        "statistics",
        "data",
        "example",
        "according",
        "evidence",
        "report",
        "survey"
    ]

    for word in evidence_words:
        if word in argument:
            evidence_usage += 4

    evidence_usage = min(evidence_usage, 100)

    if len(argument.split()) >= 30:
        argument_quality += 8
    elif len(argument.split()) >= 15:
        argument_quality += 4

    argument_quality = min(argument_quality, 100)

    if (
        "therefore" in argument
        or "because" in argument
        or "however" in argument
    ):
        logical_consistency += 8

    logical_consistency = min(logical_consistency, 100)

    if len(argument.split()) >= 20:
        communication_skills += 5

    communication_skills = min(communication_skills, 100)

    overall_score = round(
        (argument_quality * 0.30)
        + (evidence_usage * 0.20)
        + (logical_consistency * 0.20)
        + (rebuttal_effectiveness * 0.15)
        + (communication_skills * 0.15)
    )

    # ---------------- Fallacy Detection ----------------

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

    # ---------------- Recommendation ----------------

    if evidence_usage < 70:
        suggestion = (
            "Support your argument with statistics, research papers, "
            "or real-world examples."
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
    else:
        suggestion = (
            "Continue practicing structured arguments and strengthen "
            "your evidence and rebuttals."
        )

    report_data = {
        "topic": debate.topic,
        "score": overall_score,
        "argument_quality": argument_quality,
        "evidence_usage": evidence_usage,
        "logical_consistency": logical_consistency,
        "rebuttal_effectiveness": rebuttal_effectiveness,
        "communication_skills": communication_skills,
        "logical_fallacy": logical_fallacy,
        "counter_argument": counter_argument,
        "suggestion": suggestion
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

        argument = debate.argument.lower()

        score = 75

        evidence_words = [
            "because",
            "research",
            "study",
            "statistics",
            "data",
            "example",
            "according",
            "evidence",
            "report",
            "survey"
        ]

        evidence_usage = 60

        for word in evidence_words:
            if word in argument:
                evidence_usage += 4

        evidence_usage = min(evidence_usage, 100)

        argument_quality = 75

        if len(argument.split()) >= 30:
            argument_quality += 8
        elif len(argument.split()) >= 15:
            argument_quality += 4

        argument_quality = min(argument_quality, 100)

        logical_consistency = 70

        if (
            "therefore" in argument
            or "because" in argument
            or "however" in argument
        ):
            logical_consistency += 8

        logical_consistency = min(logical_consistency, 100)

        communication_skills = 75

        if len(argument.split()) >= 20:
            communication_skills += 5

        communication_skills = min(communication_skills, 100)

        score = round(
            (argument_quality * 0.30)
            + (evidence_usage * 0.20)
            + (logical_consistency * 0.20)
            + (65 * 0.15)
            + (communication_skills * 0.15)
        )

        leaderboard.append({
            "user": debate.user_email,
            "score": score
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

    # ---------------- Presentation Analysis ----------------

    word_count = len(extracted_text.split())

    # Basic presentation metrics
    clarity_score = 80
    confidence_score = 75
    engagement_score = 78

    # Estimate speech pace
    estimated_minutes = max(word_count / 130, 1)
    speech_pace = round(word_count / estimated_minutes)

    # Detect common filler words
    filler_words = [
        "um",
        "uh",
        "like",
        "actually",
        "basically",
        "you know",
        "so"
    ]

    filler_count = 0
    lower_text = extracted_text.lower()

    for filler in filler_words:
        filler_count += lower_text.count(filler)

    # Improve clarity based on content length
    if word_count >= 100:
        clarity_score += 5

    clarity_score = min(clarity_score, 100)

    overall_presentation_score = round(
        (
            clarity_score +
            confidence_score +
            engagement_score
        ) / 3
    )

    return {
        "message": "Presentation analyzed successfully!",
        "filename": file.filename,
        "uploaded_by": current_user["sub"],
        "presentation_metrics": {
            "word_count": word_count,
            "speech_pace_wpm": speech_pace,
            "filler_word_count": filler_count,
            "confidence_score": confidence_score,
            "clarity_score": clarity_score,
            "audience_engagement_score": engagement_score,
            "overall_presentation_score": overall_presentation_score
        },
        "strengths": [
            "Presentation content successfully extracted",
            "Clear presentation structure detected"
        ],
        "recommendations": [
            "Maintain a steady speaking pace",
            "Reduce filler words during delivery",
            "Use examples and evidence to improve audience engagement"
        ],
        "preview": extracted_text[:500]
    }


# ============================================================
# AI DEBATE SIMULATION ENGINE
# ============================================================

class AIDebateRequest(BaseModel):
    topic: str
    user_argument: str


# ============================================================
# AI DEBATE SIMULATION
# ============================================================

@app.post("/ai-debate")
def ai_debate(
    debate: AIDebateRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    ai_result = generate_ai_response(
        debate.topic,
        debate.user_argument
    )

    analysis = analyze_argument(
        debate.topic,
        debate.user_argument
    )

    return {
        "message": "AI debate response generated successfully!",
        "topic": debate.topic,
        "user_argument": debate.user_argument,

        "ai_opponent_response": ai_result["opponent_response"],

        "challenge_question": ai_result["challenge_question"],

        "coaching_hint": ai_result["coaching_hint"],

        "ai_analysis": {
            "clarity": analysis["clarity"],
            "relevance": analysis["relevance"],
            "evidence_strength": analysis["evidence_strength"],
            "logical_consistency": analysis["logical_consistency"],
            "persuasiveness": analysis["persuasiveness"],
            "overall_score": analysis["overall_score"],
            "fallacy": analysis["fallacy"]
        },

        "next_round": True
    }

    # ============================================================
# RECOMMENDATION & COACHING ENGINE
# ============================================================

class CoachingRequest(BaseModel):
    topic: str
    argument: str
    score: int
    logical_fallacy: str = "None Detected"


@app.post("/coaching/recommendations")
def coaching_recommendations(
    coaching: CoachingRequest,
    current_user: dict = Depends(auth.get_current_user)
):
    recommendations = []
    exercises = []
    strengths = []

    argument = coaching.argument.lower()

    # Score-based coaching
    if coaching.score >= 85:
        strengths.append("Strong overall argument performance.")
        recommendations.append(
            "Continue practicing advanced rebuttal and evidence-based reasoning."
        )
        exercises.append(
            "Practice defending your argument against three different opposing viewpoints."
        )

    elif coaching.score >= 70:
        strengths.append("Good argument structure and reasoning.")
        recommendations.append(
            "Strengthen your argument with more reliable evidence and examples."
        )
        exercises.append(
            "Add at least two statistics, studies, or real-world examples to your next debate."
        )

    else:
        recommendations.append(
            "Focus on improving argument structure, evidence usage, and logical consistency."
        )
        exercises.append(
            "Practice constructing a claim, supporting evidence, and conclusion before debating."
        )

    # Evidence coaching
    evidence_words = [
        "research",
        "study",
        "statistics",
        "data",
        "evidence",
        "report",
        "survey"
    ]

    if not any(word in argument for word in evidence_words):
        recommendations.append(
            "Use stronger evidence to support your claims."
        )
        exercises.append(
            "Practice supporting every major claim with a factual example or source."
        )
    else:
        strengths.append("Uses evidence-oriented language.")

    # Fallacy coaching
    if coaching.logical_fallacy != "None Detected":
        recommendations.append(
            f"Work on avoiding {coaching.logical_fallacy} in future arguments."
        )
        exercises.append(
            "Identify the assumptions behind your claims and replace unsupported "
            "assumptions with evidence."
        )
    else:
        strengths.append("No major logical fallacy detected.")

    # Communication coaching
    recommendations.append(
        "Maintain clear and concise communication while responding to opposing arguments."
    )

    # Learning path
    learning_path = [
        "1. Build stronger claims",
        "2. Add reliable evidence",
        "3. Identify and avoid logical fallacies",
        "4. Practice rebuttals",
        "5. Participate in multi-turn AI debate simulations"
    ]

    return {
        "message": "Personalized coaching generated successfully!",
        "user": current_user["sub"],
        "topic": coaching.topic,
        "performance_score": coaching.score,
        "strengths": strengths,
        "recommendations": recommendations,
        "recommended_exercises": exercises,
        "learning_path": learning_path
    }