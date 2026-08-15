from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import models, schemas, auth, dependencies
from .database import engine, get_db, Base

# Create all tables (dummy SQLite DB gets created on first run)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agentic AI Debate Coach & Presentation Analysis Platform",
    description="Backend API: auth, role-based access control, and user profiles.",
    version="0.1.0",
)

# Allow the local frontend (opened as a file, or served from any local port)
# to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Root / health check
# ---------------------------------------------------------------------------

@app.get("/")
def hello_world():
    return {"message": "Hello World", "service": "Agentic AI Debate Coach API", "status": "running"}


# ---------------------------------------------------------------------------
# Registration & Login
# ---------------------------------------------------------------------------

@app.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=auth.hash_password(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Every new user gets an empty profile row ready to be filled in
    profile = models.UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    return user


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm sends "username" — we treat that as the email
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user


# ---------------------------------------------------------------------------
# User Profile
# ---------------------------------------------------------------------------

@app.post("/profile", response_model=schemas.ProfileOut)
def create_or_update_profile(
    profile_in: schemas.ProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).first()
    if profile is None:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@app.get("/profile", response_model=schemas.ProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == current_user.id
    ).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


# ---------------------------------------------------------------------------
# Role-restricted example endpoints (proves RBAC works end-to-end)
# ---------------------------------------------------------------------------

@app.get("/learner/dashboard")
def learner_dashboard(
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.learner)),
):
    return {"message": f"Welcome Learner {current_user.name}", "practice_sessions": []}


@app.get("/coach/dashboard")
def coach_dashboard(
    current_user: models.User = Depends(
        dependencies.require_role(models.RoleEnum.coach, models.RoleEnum.educator, models.RoleEnum.admin)
    ),
):
    return {"message": f"Welcome Coach {current_user.name}", "assigned_learners": []}


@app.get("/educator/dashboard")
def educator_dashboard(
    current_user: models.User = Depends(
        dependencies.require_role(models.RoleEnum.educator, models.RoleEnum.admin)
    ),
):
    return {"message": f"Welcome Educator {current_user.name}", "classes": []}


@app.get("/admin/users", response_model=list[schemas.UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.admin)),
):
    return db.query(models.User).all()


# ---------------------------------------------------------------------------
# Agentic AI Debate Coach Analysis & Architecture Endpoints
# ---------------------------------------------------------------------------

from . import debate_agent, argument_analysis, fallacy_detector, presentation_service, reports_export

@app.post("/practice/start")
def start_practice_session(current_user: models.User = Depends(dependencies.get_current_user)):
    import uuid
    session_id = str(uuid.uuid4())
    debate_agent.manage_session(session_id, "started")
    return {"session_id": session_id, "message": "Practice session started."}

@app.get("/practice/sessions/{session_id}")
def get_practice_session(session_id: str, current_user: models.User = Depends(dependencies.get_current_user)):
    return {"session_id": session_id, "metadata": {}, "turns": []}

@app.post("/practice/sessions/{session_id}/turn")
def submit_turn(session_id: str, arg_in: schemas.ArgumentSubmit, current_user: models.User = Depends(dependencies.get_current_user)):
    text = arg_in.argument_text
    turn_id = "turn_123"
    analysis = argument_analysis.analyze_argument_quality(text)
    fallacies = fallacy_detector.detect_fallacies(text)
    
    return {
        "turn_id": turn_id,
        "status": "processing",
        "analysis_preview": analysis,
        "fallacies_detected": fallacies
    }

@app.get("/practice/turns/{turn_id}/analysis")
def get_turn_analysis(turn_id: str, current_user: models.User = Depends(dependencies.get_current_user)):
    return {"turn_id": turn_id, "status": "completed", "coach_feedback": "Your argument structure is solid."}

@app.post("/practice/sessions/{session_id}/end")
def end_practice_session(session_id: str, current_user: models.User = Depends(dependencies.get_current_user)):
    from . import scoring
    final_score = scoring.calculate_overall_score(80, 75, 85, 90)
    return {"session_id": session_id, "status": "ended", "overall_score": final_score}

from fastapi import UploadFile, File, Form

@app.post("/practice/transcribe")
def transcribe_audio(audio: UploadFile = File(...), current_user: models.User = Depends(dependencies.get_current_user)):
    # In a real app, this passes the audio.file to Whisper.
    # For now, we simulate transcribing the WebM file:
    import time
    time.sleep(1) # simulate processing delay
    return {"text": "This is a simulated transcription of your live audio recording! I believe Universal Basic Income is essential because..."}

@app.post("/presentation/upload")
def evaluate_presentation(
    audio: UploadFile = File(...), 
    transcript: str = Form(""),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    analysis = presentation_service.analyze_presentation(audio.filename, transcript)
    return {"presentation_analysis": analysis}

@app.get("/reports/export/{session_id}/pdf")
def export_pdf(session_id: str, current_user: models.User = Depends(dependencies.get_current_user)):
    from fastapi.responses import Response
    pdf_bytes = reports_export.export_to_pdf(session_id)
    return Response(content=pdf_bytes, media_type="application/pdf")

@app.get("/reports/export/{session_id}/excel")
def export_excel(session_id: str, current_user: models.User = Depends(dependencies.get_current_user)):
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(reports_export.export_to_excel(session_id))
