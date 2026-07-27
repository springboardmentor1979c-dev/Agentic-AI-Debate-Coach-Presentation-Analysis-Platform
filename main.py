import os
import json
import sqlite3
from typing import List
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse

from database import get_db, create_tables
from models import (
    UserRegister,
    Profile,
    ProfileUpdate,
    DebateSessionCreate,
    TurnSubmit
)
from auth import (
    hash_password,
    verify_password,
    create_access_token
)
from dependencies import (
    get_current_user,
    require_role
)

# Core service imports
from debate_agent import DebateOrchestrator
from presentation_service import analyze_presentation_audio
from scoring import calculate_session_score
from coaching import generate_coaching_recommendations
from notifications_service import create_notification, get_notifications, mark_notification_as_read
from reports_export import generate_pdf_report, generate_excel_report
from vector_search import vector_db

# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="Agentic AI Debate Coach & Presentation Analysis API",
    description="Backend API for Debate Coach & Presentation Analysis",
    version="1.0.0"
)

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Setup tables
create_tables()

# Health Endpoint
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "llm_provider": os.getenv("LLM_PROVIDER", "mock")
    }

@app.get("/")
def home():
    return {
        "message": "Debate Coach API is running"
    }

# =========================================================
# REGISTER
# =========================================================

@app.post("/register")
def register(user: UserRegister):
    allowed_roles = ["Learner", "Coach", "Educator", "Admin"]
    if user.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must contain at least 6 characters")

    conn = get_db()
    cursor = conn.cursor()

    # Restrictions on Admin Role creation
    if user.role == "Admin":
        cursor.execute("SELECT id FROM users WHERE role = 'Admin'")
        if cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=403, detail="An Admin user already exists. Public registration of Admin is restricted.")

    cursor.execute("SELECT id FROM users WHERE username = ?", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pwd = hash_password(user.password)
    try:
        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            (user.username, hashed_pwd, user.role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        # Seed an initial welcome notification
        create_notification(conn, user_id, "Welcome to Debate Coach!", "Start your learning journey by building your profile.")
    except sqlite3.Error:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Unable to register user")
    finally:
        conn.close()

    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "username": user.username,
        "role": user.role
    }

# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (form_data.username,))
    user = cursor.fetchone()
    conn.close()

    if user is None or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({
        "id": user["id"],
        "username": user["username"],
        "role": user["role"]
    })
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user

# =========================================================
# PROFILES
# =========================================================

@app.post("/profile")
def create_profile(profile: Profile, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM profiles WHERE user_id = ?", (current_user["id"],))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Profile already exists")

    try:
        cursor.execute(
            """
            INSERT INTO profiles (
                user_id, name, experience_level, goals, preferred_topics,
                presentation_domains, coaching_preferences, communication_skill_tracking
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                current_user["id"], profile.name, profile.experience_level, profile.goals, profile.preferred_topics,
                profile.presentation_domains, profile.coaching_preferences, profile.communication_skill_tracking
            )
        )
        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Unable to create profile")
    finally:
        conn.close()

    return {"message": "Profile created successfully"}

@app.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT p.*, u.username, u.role
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        """,
        (current_user["id"],)
    )
    profile = cursor.fetchone()
    conn.close()
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(profile)

@app.put("/profile")
def update_profile(profile: ProfileUpdate, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (current_user["id"],))
    existing = cursor.fetchone()
    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Profile not found")

    def val(new_val, old_val):
        return new_val if new_val is not None else old_val

    cursor.execute(
        """
        UPDATE profiles
        SET name = ?, experience_level = ?, goals = ?, preferred_topics = ?,
            presentation_domains = ?, coaching_preferences = ?, communication_skill_tracking = ?
        WHERE user_id = ?
        """,
        (
            val(profile.name, existing["name"]),
            val(profile.experience_level, existing["experience_level"]),
            val(profile.goals, existing["goals"]),
            val(profile.preferred_topics, existing["preferred_topics"]),
            val(profile.presentation_domains, existing["presentation_domains"]),
            val(profile.coaching_preferences, existing["coaching_preferences"]),
            val(profile.communication_skill_tracking, existing["communication_skill_tracking"]),
            current_user["id"]
        )
    )
    conn.commit()
    conn.close()
    return {"message": "Profile updated successfully"}

# =========================================================
# DEBATE WORKSPACE ENDPOINTS
# =========================================================

@app.post("/practice/start")
def start_practice(setup: DebateSessionCreate, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO debate_sessions (user_id, topic, format, position, difficulty, status)
        VALUES (?, ?, ?, ?, ?, 'active')
        """,
        (current_user["id"], setup.topic, setup.format, setup.position, setup.difficulty)
    )
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "message": "Practice session started",
        "session_id": session_id
    }

@app.post("/practice/sessions/{session_id}/turn")
def submit_turn(session_id: int, turn: TurnSubmit, current_user=Depends(get_current_user)):
    conn = get_db()
    
    # Authorize session ownership
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, topic FROM debate_sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    if not row or row["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied to this session")

    orchestrator = DebateOrchestrator(conn)
    result = orchestrator.process_turn(session_id, turn.content)
    
    # Register document for similarity searches
    vector_db.add_documents([turn.content], [{"session_id": session_id, "speaker": "User", "topic": row["topic"]}])
    
    conn.close()
    return result

@app.post("/practice/sessions/{session_id}/end")
def end_session(session_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM debate_sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    if not row or row["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied to this session")

    cursor.execute("UPDATE debate_sessions SET status = 'completed' WHERE id = ?", (session_id,))
    scores = calculate_session_score(conn, session_id)
    
    # In-app Milestone trigger notification
    if scores["overall_score"] >= 80:
        create_notification(conn, current_user["id"], "Milestone Achieved!", f"Excellent! You scored {scores['overall_score']}% in your last debate.")

    conn.close()
    return {
        "message": "Session completed and scored",
        "scores": scores
    }

@app.get("/practice/sessions/{session_id}")
def get_session_details(session_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,))
    session = cursor.fetchone()
    if not session or session["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied to this session")

    # Fetch turns
    cursor.execute("SELECT * FROM debate_turns WHERE session_id = ? ORDER BY id ASC", (session_id,))
    turns = [dict(t) for t in cursor.fetchall()]

    # Fetch scores
    cursor.execute("SELECT * FROM performance_scores WHERE session_id = ?", (session_id,))
    score_row = cursor.fetchone()
    scores = dict(score_row) if score_row else None

    # Fetch fallacy reports and analyses for turns
    turns_with_details = []
    for turn in turns:
        t_dict = dict(turn)
        cursor.execute("SELECT * FROM argument_analyses WHERE turn_id = ?", (turn["id"],))
        aa = cursor.fetchone()
        t_dict["analysis"] = dict(aa) if aa else None

        cursor.execute("SELECT * FROM fallacy_detections WHERE turn_id = ?", (turn["id"],))
        fds = cursor.fetchall()
        t_dict["fallacies"] = [dict(f) for f in fds]
        turns_with_details.append(t_dict)

    conn.close()
    return {
        "session": dict(session),
        "turns": turns_with_details,
        "scores": scores
    }

@app.get("/practice/history")
def get_practice_history(current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT ds.*, ps.overall_score
        FROM debate_sessions ds
        LEFT JOIN performance_scores ps ON ds.id = ps.session_id
        WHERE ds.user_id = ?
        ORDER BY ds.id DESC
        """,
        (current_user["id"],)
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# =========================================================
# PRESENTATION SERVICE ENDPOINTS
# =========================================================

@app.post("/presentation/upload")
def upload_presentation(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    # Save the file temporarily
    os.makedirs("uploads", exist_ok=True)
    temp_path = f"uploads/{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(file.file.read())

    conn = get_db()
    cursor = conn.cursor()
    
    try:
        analysis = analyze_presentation_audio(temp_path)
        
        cursor.execute(
            """
            INSERT INTO presentation_sessions (user_id, filename, duration, transcript)
            VALUES (?, ?, ?, ?)
            """,
            (current_user["id"], file.filename, analysis["duration"], analysis["transcript"])
        )
        presentation_id = cursor.lastrowid

        cursor.execute(
            """
            INSERT INTO presentation_analyses (
                presentation_id, speech_pace, filler_word_usage, confidence_score, clarity_score, audience_engagement_score, feedback
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                presentation_id,
                analysis["speech_pace"],
                json.dumps(analysis["filler_word_usage"]),
                analysis["confidence_score"],
                analysis["clarity_score"],
                analysis["audience_engagement_score"],
                analysis["feedback"]
            )
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

    # Clean up uploaded audio file
    if os.path.exists(temp_path):
        os.remove(temp_path)

    return {
        "presentation_id": presentation_id,
        "analysis": analysis
    }

@app.get("/presentation/history")
def get_presentation_history(current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT ps.*, pa.speech_pace, pa.confidence_score, pa.clarity_score, pa.audience_engagement_score, pa.feedback, pa.filler_word_usage
        FROM presentation_sessions ps
        JOIN presentation_analyses pa ON ps.id = pa.presentation_id
        WHERE ps.user_id = ?
        ORDER BY ps.id DESC
        """,
        (current_user["id"],)
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# =========================================================
# RECOMMENDATION & COACHING INSIGHTS
# =========================================================

@app.get("/coaching/insights")
def get_insights(current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get profile details
    cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (current_user["id"],))
    profile_row = cursor.fetchone()
    profile = dict(profile_row) if profile_row else {}

    # Get debate history
    cursor.execute(
        """
        SELECT ds.*, ps.overall_score
        FROM debate_sessions ds
        JOIN performance_scores ps ON ds.id = ps.session_id
        WHERE ds.user_id = ? LIMIT 3
        """, (current_user["id"],)
    )
    debate_history = [dict(r) for r in cursor.fetchall()]

    # Get presentation history
    cursor.execute(
        """
        SELECT ps.*, pa.confidence_score
        FROM presentation_sessions ps
        JOIN presentation_analyses pa ON ps.id = pa.presentation_id
        WHERE ps.user_id = ? LIMIT 3
        """, (current_user["id"],)
    )
    presentation_history = [dict(r) for r in cursor.fetchall()]
    conn.close()

    insights = generate_coaching_recommendations(profile, debate_history, presentation_history)
    return insights

# =========================================================
# NOTIFICATION ENDPOINTS
# =========================================================

@app.get("/notifications")
def get_user_notifications(current_user=Depends(get_current_user)):
    conn = get_db()
    notes = get_notifications(conn, current_user["id"])
    conn.close()
    return notes

@app.post("/notifications/{notification_id}/read")
def mark_read(notification_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    mark_notification_as_read(conn, notification_id, current_user["id"])
    conn.close()
    return {"message": "Notification marked as read"}

# =========================================================
# REPORTS & EXPORTS
# =========================================================

@app.get("/reports/export/{session_id}/pdf")
def export_pdf(session_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,))
    session = cursor.fetchone()
    if not session or session["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied")

    cursor.execute("SELECT * FROM performance_scores WHERE session_id = ?", (session_id,))
    score_row = cursor.fetchone()
    scores = dict(score_row) if score_row else {}

    # Sample static coaching tips for the PDF export
    recommendations = ["Speak slower", "Cite statistics to build argument authority", "Restructure key assertions logically"]

    os.makedirs("exports", exist_ok=True)
    pdf_path = f"exports/report_session_{session_id}.pdf"
    
    generate_pdf_report(pdf_path, current_user, dict(session), scores, [], recommendations)
    conn.close()
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"report_session_{session_id}.pdf")

@app.get("/reports/export/{session_id}/excel")
def export_excel(session_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,))
    session = cursor.fetchone()
    if not session or session["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied")

    cursor.execute("SELECT * FROM performance_scores WHERE session_id = ?", (session_id,))
    score_row = cursor.fetchone()
    scores = dict(score_row) if score_row else {}

    os.makedirs("exports", exist_ok=True)
    excel_path = f"exports/report_session_{session_id}.xlsx"
    
    generate_excel_report(excel_path, current_user, dict(session), scores, [])
    conn.close()
    return FileResponse(excel_path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=f"report_session_{session_id}.xlsx")

# =========================================================
# WORKSPACE ROLES
# =========================================================

@app.get("/learner")
def learner_route(current_user=Depends(require_role(["Learner", "Admin"]))):
    return {"message": "Learner access granted", "user": current_user}

@app.get("/coach")
def coach_route(current_user=Depends(require_role(["Coach", "Admin"]))):
    # Fetch all student profiles and sessions for aggregate progress monitoring
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT u.username, p.name, p.experience_level FROM profiles p JOIN users u ON p.user_id = u.id")
    students = [dict(s) for s in cursor.fetchall()]
    conn.close()
    return {"message": "Coach access granted", "students": students}

@app.get("/educator")
def educator_route(current_user=Depends(require_role(["Educator", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT ds.topic, COUNT(*) as practice_count, AVG(ps.overall_score) as avg_score
        FROM debate_sessions ds
        JOIN performance_scores ps ON ds.id = ps.session_id
        GROUP BY ds.topic
        """
    )
    class_analytics = [dict(a) for a in cursor.fetchall()]
    conn.close()
    return {"message": "Educator access granted", "class_analytics": class_analytics}

@app.get("/admin")
def admin_route(current_user=Depends(require_role(["Admin"]))):
    return {"message": "Admin access granted", "user": current_user}

@app.get("/admin/users")
def get_all_users(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role FROM users")
    users = [dict(u) for u in cursor.fetchall()]
    conn.close()
    return users

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, current_user=Depends(require_role(["Admin"]))):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if cursor.fetchone() is None:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("DELETE FROM profiles WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"message": "User deleted successfully"}