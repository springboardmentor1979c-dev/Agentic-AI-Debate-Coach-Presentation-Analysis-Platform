import os
import json
import sqlite3
from typing import List
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Request, Form, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, StreamingResponse

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

# Whisper cache on demand
WHISPER_MODEL = None

def decode_audio_ffmpeg(filepath: str):
    import subprocess
    import numpy as np
    try:
        # Run ffmpeg to convert to 16kHz mono 16-bit PCM to stdout
        cmd = [
            "ffmpeg", "-y", "-i", filepath,
            "-ar", "16000", "-ac", "1", "-f", "s16le", "-"
        ]
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        if process.returncode != 0 or len(stdout) == 0:
            print(f"ffmpeg process returned {process.returncode}, stderr: {stderr.decode('utf-8', errors='ignore')}")
            return np.array([], dtype=np.float32)
        # Convert raw bytes (16-bit signed integer PCM) to float32 normalized
        audio_data = np.frombuffer(stdout, dtype=np.int16).astype(np.float32) / 32768.0
        return audio_data
    except Exception as e:
        print(f"FFmpeg fallback decoding failed: {e}")
        return np.array([], dtype=np.float32)

def decode_audio_pyav(filepath: str):
    import av
    import numpy as np
    try:
        container = av.open(filepath)
        stream = container.streams.audio[0]
        resampler = av.AudioResampler(format='fltp', layout='mono', rate=16000)
        audio_frames = []
        for frame in container.decode(stream):
            resampled_frames = resampler.resample(frame)
            for rf in resampled_frames:
                audio_frames.append(rf.to_ndarray().flatten())
        if not audio_frames:
            raise ValueError("No audio frames decoded by PyAV")
        return np.concatenate(audio_frames).astype(np.float32)
    except Exception as e:
        print(f"PyAV decoding failed: {e}. Trying FFmpeg fallback...")
        return decode_audio_ffmpeg(filepath)

def transcribe_audio_whisper(filepath: str) -> str:
    global WHISPER_MODEL
    try:
        import whisper
        import numpy as np
        import time
        t0 = time.time()
        
        if WHISPER_MODEL is None:
            # Use base model (74M params) - dramatically better accuracy than tiny (39M)
            # for Indian English, accented speech, and background noise
            print("[Whisper] Loading base model (first call only)...")
            WHISPER_MODEL = whisper.load_model("base")
            print(f"[Whisper] Model loaded in {time.time() - t0:.1f}s")
        
        audio_data = decode_audio_pyav(filepath)
        if audio_data.size == 0:
            print("[Whisper] Empty audio data after decoding")
            return ""
        
        audio_duration = len(audio_data) / 16000.0
        print(f"[Whisper] Transcribing {audio_duration:.1f}s of audio ({len(audio_data)} samples)")
        
        t1 = time.time()
        result = WHISPER_MODEL.transcribe(
            audio_data,
            fp16=False,                # Stable CPU execution
            language="en",             # Force English - prevents Korean/German misdetection
            initial_prompt="This is a spoken English debate about policy, society, and education.",
        )
        transcribe_ms = int((time.time() - t1) * 1000)
        
        text = result.get("text", "").strip()
        print(f"[Whisper] Result ({transcribe_ms}ms): \"{text}\"")
        
        # Expanded hallucination filter for silence/noise inputs
        HALLUCINATIONS = {
            "outro", "outro.", "outro...",
            "thank you", "thank you.", "thanks for watching",
            "subtitles by", "subtitles", "subscribe",
            "please subscribe", "like and subscribe",
            "swan", "swan.", "sports", "sports.",
            "watching", "bye", "bye.", "bye bye",
            "you", "the end", "the end.",
            "thanks", "thanks.", "so",
            "i'm not sure", "i don't know",
        }
        text_lower = text.lower().strip(" .")
        if text_lower in HALLUCINATIONS or len(text) < 3:
            print(f"[Whisper] Filtered hallucination: \"{text}\"")
            return ""
            
        return text
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[Whisper] Transcription failed: {e}")
        return ""

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

def run_background_turn_analysis(user_turn_id: int, user_content: str):
    conn = get_db()
    try:
        from argument_analysis import analyze_argument
        from fallacy_detector import detect_fallacies
        
        analysis = analyze_argument(user_content)
        fallacies = detect_fallacies(user_content)
        
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO argument_analyses (
                turn_id, claims, evidence, reasoning_analysis,
                clarity, relevance, evidence_strength, logical_consistency, persuasiveness,
                strengths, weaknesses, feedback
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_turn_id,
                json.dumps(analysis["claims"]),
                json.dumps(analysis["evidence"]),
                json.dumps(analysis["reasoning_analysis"]),
                analysis["scores"]["clarity"],
                analysis["scores"]["relevance"],
                analysis["scores"]["evidence_strength"],
                analysis["scores"]["logical_consistency"],
                analysis["scores"]["persuasiveness"],
                json.dumps(analysis["strengths"]),
                json.dumps(analysis["weaknesses"]),
                json.dumps(analysis["feedback"])
            )
        )

        for fallacy in fallacies:
            cursor.execute(
                """
                INSERT INTO fallacy_detections (
                    turn_id, type, span, explanation, confidence, correction
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_turn_id,
                    fallacy["type"],
                    fallacy.get("span", ""),
                    fallacy.get("explanation", ""),
                    fallacy.get("confidence", 0.5),
                    fallacy.get("correction", "")
                )
            )
        conn.commit()
    except Exception as e:
        print(f"Background analysis failed: {e}")
    finally:
        conn.close()

@app.post("/practice/sessions/{session_id}/turn")
async def submit_turn(session_id: int, request: Request, background_tasks: BackgroundTasks, current_user=Depends(get_current_user)):
    conn = get_db()
    
    # Authorize session ownership
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, topic FROM debate_sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    if not row or row["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied to this session")

    content_type = request.headers.get("content-type", "")
    content = ""
    duration = 0.0
    audio_path = None
    stream_requested = False
    prefer_whisper = False

    if "application/json" in content_type:
        body = await request.json()
        content = body.get("content", "")
        stream_requested = body.get("stream", False)
        prefer_whisper = body.get("prefer_whisper", False)
    else:
        form = await request.form()
        content = form.get("content", "")
        duration = float(form.get("duration", 0.0))
        stream_requested = form.get("stream", "false").lower() in ("true", "1")
        prefer_whisper = form.get("prefer_whisper", "false").lower() in ("true", "1")
        audio_file = form.get("audio")
        
        if audio_file and audio_file.filename:
            # Check turn count to name the file turn_<number>.webm
            cursor.execute("SELECT COUNT(*) as turn_count FROM debate_turns WHERE session_id = ?", (session_id,))
            turn_count = cursor.fetchone()["turn_count"]
            
            dest_dir = f"uploads/debates/user_{current_user['id']}/session_{session_id}"
            os.makedirs(dest_dir, exist_ok=True)
            
            ext = os.path.splitext(audio_file.filename)[1] or ".webm"
            dest_filename = f"turn_{turn_count + 1}{ext}"
            audio_path = f"{dest_dir}/{dest_filename}"
            
            with open(audio_path, "wb") as buffer:
                buffer.write(await audio_file.read())

    if prefer_whisper or not content or not content.strip():
        if audio_path:
            content = transcribe_audio_whisper(audio_path)

    if not content or not content.strip():
        conn.close()
        raise HTTPException(status_code=400, detail="Empty speech argument. Please speak clearly or type instead.")

    # Validation: reject low quality or gibberish
    cleaned_transcript = content.strip().lower()
    import re
    if len(cleaned_transcript) < 3 or not re.search(r"[a-zA-Z0-9]", cleaned_transcript):
        conn.close()
        raise HTTPException(status_code=400, detail="Unable to understand. Please repeat your argument clearly.")

    if stream_requested:
        import time
        t_start = time.time()
        
        from ai_providers import ai_provider
        orchestrator = DebateOrchestrator(conn)
        prep = orchestrator.process_turn_stream(session_id, content, audio_path, duration)
        
        t_prep = time.time()
        print(f"[Pipeline] Turn prep: {int((t_prep - t_start)*1000)}ms")
        
        # Run argument analysis and fallacy detection in the background to avoid blocking AI stream
        background_tasks.add_task(run_background_turn_analysis, prep["user_turn_id"], content)
        
        # Register document for similarity searches in the background
        background_tasks.add_task(
            vector_db.add_documents,
            [content],
            [{"session_id": session_id, "speaker": "User", "topic": row["topic"]}]
        )
        
        async def event_generator():
            import time as _time
            _t0 = _time.time()
            
            # Send initial analysis payload
            initial_payload = {
                "type": "analysis",
                "user_turn_id": prep["user_turn_id"],
                "user_transcript": content,
                "user_analysis": None,
                "user_fallacies": []
            }
            yield f"data: {json.dumps(initial_payload)}\n\n"
            
            # Stream response content
            accumulated_response = ""
            first_token_logged = False
            for chunk in ai_provider.complete_stream(prep["prompt"], system_prompt="You are a focused, eloquent, and analytical debate opponent agent."):
                if not first_token_logged:
                    print(f"[Pipeline] First Groq token: {int((_time.time() - _t0)*1000)}ms after stream start")
                    first_token_logged = True
                accumulated_response += chunk
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
            
            _t1 = _time.time()
            print(f"[Pipeline] Groq stream complete: {int((_t1 - _t0)*1000)}ms, {len(accumulated_response)} chars")
            
            # Save final AI response to database
            inner_conn = get_db()
            inner_orchestrator = DebateOrchestrator(inner_conn)
            ai_turn_id = inner_orchestrator.save_ai_turn(session_id, accumulated_response.strip())
            inner_conn.close()
            
            print(f"[Pipeline] DB save: {int((_time.time() - _t1)*1000)}ms")
            
            yield f"data: {json.dumps({'type': 'done', 'ai_turn_id': ai_turn_id})}\n\n"

        conn.close()
        return StreamingResponse(event_generator(), media_type="text/event-stream")
    else:
        orchestrator = DebateOrchestrator(conn)
        result = orchestrator.process_turn(session_id, content, audio_path, duration)
        result["user_transcript"] = content
        
        # Register document for similarity searches
        vector_db.add_documents([content], [{"session_id": session_id, "speaker": "User", "topic": row["topic"]}])
        
        conn.close()
        return result

@app.websocket("/practice/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    await websocket.accept()
    import tempfile
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"ws_transcribe_{os.urandom(8).hex()}.webm")
    
    try:
        with open(temp_path, "wb") as f:
            pass
            
        while True:
            # Receive binary chunk
            data = await websocket.receive_bytes()
            if not data:
                break
                
            with open(temp_path, "ab") as f:
                f.write(data)
                
            text = transcribe_audio_whisper(temp_path)
            await websocket.send_json({"transcript": text})
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket transcription error: {e}")
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@app.post("/practice/transcribe")
async def transcribe_audio(audio: UploadFile = File(...), current_user=Depends(get_current_user)):
    import tempfile
    temp_dir = tempfile.gettempdir()
    ext = os.path.splitext(audio.filename)[1] or ".webm"
    temp_path = os.path.join(temp_dir, f"transcribe_{os.urandom(8).hex()}{ext}")
    with open(temp_path, "wb") as buffer:
        buffer.write(await audio.read())
    import time
    start_time = time.time()
    try:
        text = transcribe_audio_whisper(temp_path)
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
    latency_ms = int((time.time() - start_time) * 1000)
    return {"transcript": text, "latency_ms": latency_ms}

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

@app.get("/practice/turns/{turn_id}/analysis")
def get_turn_analysis(turn_id: int, current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Verify owner of this turn
    cursor.execute("""
        SELECT ds.user_id 
        FROM debate_turns dt
        JOIN debate_sessions ds ON dt.session_id = ds.id
        WHERE dt.id = ?
    """, (turn_id,))
    row = cursor.fetchone()
    if not row or row["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Access denied or turn not found")
        
    cursor.execute("SELECT * FROM argument_analyses WHERE turn_id = ?", (turn_id,))
    aa = cursor.fetchone()
    
    cursor.execute("SELECT * FROM fallacy_detections WHERE turn_id = ?", (turn_id,))
    fds = cursor.fetchall()
    
    conn.close()
    
    return {
        "analysis": dict(aa) if aa else None,
        "fallacies": [dict(f) for f in fds]
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

@app.get("/uploads/debates/user_{user_id}/session_{session_id}/{filename}")
def get_debate_audio(user_id: int, session_id: int, filename: str, current_user=Depends(get_current_user)):
    if current_user["id"] != user_id and current_user["role"] not in ["Admin", "Coach"]:
        raise HTTPException(status_code=403, detail="Access denied to this audio file")
    
    filepath = f"uploads/debates/user_{user_id}/session_{session_id}/{filename}"
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found")
        
    return FileResponse(filepath)

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
# WORKSPACE ROLES & RBAC SECURITY
# =========================================================

from pydantic import BaseModel

class RoleUpdate(BaseModel):
    role: str

@app.get("/learner")
def learner_route(current_user=Depends(require_role(["Learner", "Admin"]))):
    return {"message": "Learner access granted", "user": current_user}

# --- COACH ENDPOINTS ---

@app.get("/coach")
def coach_base_route(current_user=Depends(require_role(["Coach", "Admin"]))):
    return {"message": "Coach access granted", "user": current_user}

@app.get("/coach/overview")
def get_coach_overview(current_user=Depends(require_role(["Coach", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM coach_learner_assignments WHERE coach_id = ?", (current_user["id"],))
    learner_count = cursor.fetchone()[0]
    
    cursor.execute(
        """
        SELECT COUNT(*) FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        JOIN coach_learner_assignments cla ON ds.user_id = cla.learner_id
        WHERE cla.coach_id = ?
        """,
        (current_user["id"],)
    )
    completed_debates = cursor.fetchone()[0]
    
    cursor.execute(
        """
        SELECT AVG(ps.overall_score) FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        JOIN coach_learner_assignments cla ON ds.user_id = cla.learner_id
        WHERE cla.coach_id = ?
        """,
        (current_user["id"],)
    )
    avg_performance = cursor.fetchone()[0] or 0.0
    
    cursor.execute(
        """
        SELECT COUNT(DISTINCT cla.learner_id) FROM coach_learner_assignments cla
        JOIN debate_sessions ds ON cla.learner_id = ds.user_id
        JOIN performance_scores ps ON ds.id = ps.session_id
        WHERE cla.coach_id = ?
        GROUP BY cla.learner_id
        HAVING AVG(ps.overall_score) < 60.0
        """,
        (current_user["id"],)
    )
    needing_attention = len(cursor.fetchall())
    
    conn.close()
    return {
        "learner_count": learner_count,
        "completed_debates": completed_debates,
        "avg_performance": round(avg_performance, 1),
        "needing_attention": needing_attention
    }

@app.get("/coach/learners")
def get_coach_learners(current_user=Depends(require_role(["Coach", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT u.id, u.username, p.name, p.experience_level FROM users u
        JOIN profiles p ON u.id = p.user_id
        JOIN coach_learner_assignments cla ON u.id = cla.learner_id
        WHERE cla.coach_id = ?
        """,
        (current_user["id"],)
    )
    rows = cursor.fetchall()
    
    learners = []
    for row in rows:
        learner_id = row["id"]
        cursor.execute(
            "SELECT COUNT(*) FROM performance_scores ps JOIN debate_sessions ds ON ps.session_id = ds.id WHERE ds.user_id = ?",
            (learner_id,)
        )
        debates_count = cursor.fetchone()[0]
        
        cursor.execute(
            "SELECT AVG(overall_score) FROM performance_scores ps JOIN debate_sessions ds ON ps.session_id = ds.id WHERE ds.user_id = ?",
            (learner_id,)
        )
        avg_score = cursor.fetchone()[0]
        
        cursor.execute(
            "SELECT overall_score FROM performance_scores ps JOIN debate_sessions ds ON ps.session_id = ds.id WHERE ds.user_id = ? ORDER BY ps.timestamp DESC LIMIT 1",
            (learner_id,)
        )
        recent_row = cursor.fetchone()
        recent_score = recent_row[0] if recent_row else None
        
        cursor.execute(
            "SELECT overall_score FROM performance_scores ps JOIN debate_sessions ds ON ps.session_id = ds.id WHERE ds.user_id = ? ORDER BY ps.timestamp DESC LIMIT 3",
            (learner_id,)
        )
        last_scores = [r[0] for r in cursor.fetchall()]
        trend = "Stable"
        if len(last_scores) >= 2:
            if last_scores[0] > last_scores[-1]:
                trend = "Improving"
            elif last_scores[0] < last_scores[-1]:
                trend = "Declining"
                
        cursor.execute(
            """
            SELECT AVG(argument_quality), AVG(evidence_usage), AVG(logical_consistency), AVG(rebuttal_effectiveness), AVG(communication_skills)
            FROM performance_scores ps JOIN debate_sessions ds ON ps.session_id = ds.id WHERE ds.user_id = ?
            """,
            (learner_id,)
        )
        dims_row = cursor.fetchone()
        skill_gap = "No data"
        if dims_row and dims_row[0] is not None:
            dims = {
                "Argument Quality": dims_row[0],
                "Evidence Usage": dims_row[1],
                "Logical Consistency": dims_row[2],
                "Rebuttal Effectiveness": dims_row[3],
                "Communication Skills": dims_row[4]
            }
            skill_gap = min(dims, key=dims.get)
            
        learners.append({
            "id": learner_id,
            "username": row["username"],
            "name": row["name"],
            "experience_level": row["experience_level"],
            "debates_count": debates_count,
            "avg_score": round(avg_score, 1) if avg_score else None,
            "recent_score": recent_score,
            "trend": trend,
            "primary_gap": skill_gap
        })
        
    conn.close()
    return learners

@app.get("/coach/learners/{learner_id}")
def get_coach_learner_detail(learner_id: int, current_user=Depends(require_role(["Coach", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    
    if current_user["role"] != "Admin":
        cursor.execute(
            "SELECT id FROM coach_learner_assignments WHERE coach_id = ? AND learner_id = ?",
            (current_user["id"], learner_id)
        )
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=403, detail="You are not authorized to view this learner")
            
    cursor.execute(
        "SELECT u.username, p.* FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.id = ?",
        (learner_id,)
    )
    profile_row = cursor.fetchone()
    if not profile_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Learner profile not found")
        
    cursor.execute(
        """
        SELECT 
            AVG(argument_quality) as arg, 
            AVG(evidence_usage) as ev, 
            AVG(logical_consistency) as logic, 
            AVG(rebuttal_effectiveness) as rebuttal, 
            AVG(communication_skills) as comm,
            AVG(overall_score) as overall
        FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        WHERE ds.user_id = ?
        """,
        (learner_id,)
    )
    scores_row = cursor.fetchone()
    
    primary_gap = None
    secondary_gap = None
    primary_score = 100.0
    secondary_score = 100.0
    
    if scores_row and scores_row["arg"] is not None:
        dims = {
            "Argument Quality": scores_row["arg"],
            "Evidence Usage": scores_row["ev"],
            "Logical Consistency": scores_row["logic"],
            "Rebuttal Effectiveness": scores_row["rebuttal"],
            "Communication Skills": scores_row["comm"]
        }
        sorted_dims = sorted(dims.items(), key=lambda x: x[1])
        primary_gap = sorted_dims[0][0]
        primary_score = round(sorted_dims[0][1], 1)
        secondary_gap = sorted_dims[1][0]
        secondary_score = round(sorted_dims[1][1], 1)
        
    cursor.execute(
        """
        SELECT ds.id, ds.topic, ds.format, ds.position, ds.difficulty, ds.created_at, ps.overall_score
        FROM debate_sessions ds
        LEFT JOIN performance_scores ps ON ds.id = ps.session_id
        WHERE ds.user_id = ? AND ds.status = 'Completed'
        ORDER BY ds.id DESC
        """,
        (learner_id,)
    )
    evaluations = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute(
        """
        SELECT ps.overall_score, ds.id
        FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        WHERE ds.user_id = ?
        ORDER BY ds.id ASC
        """,
        (learner_id,)
    )
    trend = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute(
        "SELECT * FROM recommendations WHERE user_id = ? ORDER BY id DESC LIMIT 5",
        (learner_id,)
    )
    recs = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    return {
        "profile": dict(profile_row),
        "scores": {
            "argument_quality": round(scores_row["arg"], 1) if scores_row["arg"] is not None else 0,
            "evidence_usage": round(scores_row["ev"], 1) if scores_row["ev"] is not None else 0,
            "logical_consistency": round(scores_row["logic"], 1) if scores_row["logic"] is not None else 0,
            "rebuttal_effectiveness": round(scores_row["rebuttal"], 1) if scores_row["rebuttal"] is not None else 0,
            "communication_skills": round(scores_row["comm"], 1) if scores_row["comm"] is not None else 0,
            "overall_score": round(scores_row["overall"], 1) if scores_row["overall"] is not None else 0
        },
        "gaps": {
            "primary": {"name": primary_gap, "score": primary_score},
            "secondary": {"name": secondary_gap, "score": secondary_score}
        },
        "evaluations": evaluations,
        "trend": trend,
        "recommendations": recs
    }

# --- EDUCATOR ENDPOINTS ---

@app.get("/educator")
def educator_base_route(current_user=Depends(require_role(["Educator", "Admin"]))):
    return {"message": "Educator access granted", "user": current_user}

@app.get("/educator/overview")
def get_educator_overview(current_user=Depends(require_role(["Educator", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        """
        SELECT COUNT(DISTINCT cm.learner_id) FROM class_members cm
        JOIN classes c ON cm.class_id = c.id
        WHERE c.educator_id = ?
        """,
        (current_user["id"],)
    )
    total_students = cursor.fetchone()[0]
    
    cursor.execute(
        """
        SELECT COUNT(*) FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        JOIN class_members cm ON ds.user_id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        WHERE c.educator_id = ?
        """,
        (current_user["id"],)
    )
    completed_debates = cursor.fetchone()[0]
    
    cursor.execute(
        """
        SELECT COUNT(*) FROM presentation_sessions prs
        JOIN class_members cm ON prs.user_id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        WHERE c.educator_id = ?
        """,
        (current_user["id"],)
    )
    presentations_count = cursor.fetchone()[0]
    
    cursor.execute(
        """
        SELECT AVG(ps.overall_score) FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        JOIN class_members cm ON ds.user_id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        WHERE c.educator_id = ?
        """,
        (current_user["id"],)
    )
    class_average = cursor.fetchone()[0] or 0.0
    
    conn.close()
    return {
        "total_students": total_students,
        "completed_debates": completed_debates,
        "presentations_count": presentations_count,
        "class_average": round(class_average, 1)
    }

@app.get("/educator/analytics")
def get_educator_analytics(current_user=Depends(require_role(["Educator", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 
            AVG(argument_quality) as arg, 
            AVG(evidence_usage) as ev, 
            AVG(logical_consistency) as logic, 
            AVG(rebuttal_effectiveness) as rebuttal, 
            AVG(communication_skills) as comm,
            AVG(overall_score) as overall
        FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        JOIN class_members cm ON ds.user_id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        WHERE c.educator_id = ?
        """,
        (current_user["id"],)
    )
    row = cursor.fetchone()
    conn.close()
    return {
        "argument_quality": round(row["arg"], 1) if row["arg"] is not None else 0,
        "evidence_usage": round(row["ev"], 1) if row["ev"] is not None else 0,
        "logical_consistency": round(row["logic"], 1) if row["logic"] is not None else 0,
        "rebuttal_effectiveness": round(row["rebuttal"], 1) if row["rebuttal"] is not None else 0,
        "communication_skills": round(row["comm"], 1) if row["comm"] is not None else 0,
        "overall_score": round(row["overall"], 1) if row["overall"] is not None else 0
    }

@app.get("/educator/rankings")
def get_educator_rankings(current_user=Depends(require_role(["Educator", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT u.id, u.username, p.name, COUNT(ps.id) as debates_count, AVG(ps.overall_score) as avg_score
        FROM users u
        JOIN profiles p ON u.id = p.user_id
        JOIN class_members cm ON u.id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        LEFT JOIN debate_sessions ds ON u.id = ds.user_id
        LEFT JOIN performance_scores ps ON ds.id = ps.session_id
        WHERE c.educator_id = ?
        GROUP BY u.id
        ORDER BY avg_score DESC
        """,
        (current_user["id"],)
    )
    rows = cursor.fetchall()
    rankings = []
    for idx, row in enumerate(rows):
        rankings.append({
            "rank": idx + 1,
            "name": row["name"],
            "username": row["username"],
            "debates_count": row["debates_count"],
            "avg_score": round(row["avg_score"], 1) if row["avg_score"] is not None else None
        })
    conn.close()
    return rankings

@app.get("/educator/debate-reports")
def get_educator_debate_reports(current_user=Depends(require_role(["Educator", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT ds.id, u.username, p.name, ds.topic, ds.format, ds.position, ps.overall_score, ds.created_at
        FROM debate_sessions ds
        JOIN users u ON ds.user_id = u.id
        JOIN profiles p ON u.id = p.user_id
        JOIN class_members cm ON u.id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        JOIN performance_scores ps ON ds.id = ps.session_id
        WHERE c.educator_id = ?
        ORDER BY ds.id DESC
        """,
        (current_user["id"],)
    )
    reports = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return reports

@app.get("/educator/presentation-reports")
def get_educator_presentation_reports(current_user=Depends(require_role(["Educator", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT ps.id, u.username, prof.name, ps.filename, ps.duration, pa.speech_pace, pa.filler_word_usage, pa.confidence_score, pa.clarity_score, ps.created_at
        FROM presentation_sessions ps
        JOIN users u ON ps.user_id = u.id
        JOIN profiles prof ON u.id = prof.user_id
        JOIN class_members cm ON u.id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        LEFT JOIN presentation_analyses pa ON ps.id = pa.presentation_id
        WHERE c.educator_id = ?
        ORDER BY ps.id DESC
        """,
        (current_user["id"],)
    )
    reports = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return reports

# --- ADMIN ENDPOINTS ---

@app.get("/admin")
def admin_base_route(current_user=Depends(require_role(["Admin"]))):
    return {"message": "Admin access granted", "user": current_user}

@app.get("/admin/overview")
def get_admin_overview(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'Learner'")
    learners = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'Coach'")
    coaches = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'Educator'")
    educators = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM debate_sessions WHERE status = 'Completed'")
    completed_debates = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM presentation_sessions")
    presentation_analyses = cursor.fetchone()[0]
    conn.close()
    return {
        "total_users": total_users,
        "learners": learners,
        "coaches": coaches,
        "educators": educators,
        "completed_debates": completed_debates,
        "presentation_analyses": presentation_analyses
    }

@app.get("/admin/users")
def get_all_users(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role FROM users")
    users = [dict(u) for u in cursor.fetchall()]
    conn.close()
    return users

@app.patch("/admin/users/{user_id}/role")
def update_user_role(user_id: int, payload: RoleUpdate, current_user=Depends(require_role(["Admin"]))):
    allowed_roles = ["Learner", "Coach", "Educator", "Admin"]
    if payload.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role specified")
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot change your own role")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    cursor.execute("UPDATE users SET role = ? WHERE id = ?", (payload.role, user_id))
    conn.commit()
    conn.close()
    return {"message": "User role updated successfully"}

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

@app.get("/admin/ai-monitoring")
def get_ai_monitoring(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    provider = os.getenv("LLM_PROVIDER", "mock")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    cursor.execute("SELECT COUNT(*) FROM ai_request_logs")
    total_requests = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM ai_request_logs WHERE success = 1")
    successful_requests = cursor.fetchone()[0]
    cursor.execute("SELECT AVG(latency_ms) FROM ai_request_logs")
    avg_latency = cursor.fetchone()[0] or 0.0
    cursor.execute("SELECT timestamp FROM ai_request_logs WHERE success = 1 ORDER BY id DESC LIMIT 1")
    last_success_row = cursor.fetchone()
    last_success = last_success_row[0] if last_success_row else None
    cursor.execute("SELECT id, provider, model, operation, success, latency_ms, timestamp, error_category FROM ai_request_logs ORDER BY id DESC LIMIT 10")
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {
        "provider": provider,
        "model": model,
        "total_requests": total_requests,
        "success_rate": round((successful_requests / total_requests * 100), 1) if total_requests > 0 else 0,
        "avg_latency_ms": round(avg_latency, 1),
        "last_success": last_success,
        "logs": logs
    }

@app.get("/admin/analytics")
def get_admin_analytics(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT DATE(created_at) as date, COUNT(*) as count FROM debate_sessions GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 15")
    debates_over_time = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
    users_by_role = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT topic, COUNT(*) as count FROM debate_sessions GROUP BY topic ORDER BY count DESC LIMIT 5")
    top_topics = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {
        "debates_over_time": debates_over_time,
        "users_by_role": users_by_role,
        "top_topics": top_topics
    }

@app.get("/admin/system-reports")
def get_admin_system_reports(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 'Debate' as type, ds.topic as details, u.username, ds.created_at as timestamp 
        FROM debate_sessions ds JOIN users u ON ds.user_id = u.id
        UNION ALL
        SELECT 'Presentation' as type, filename as details, username, created_at as timestamp
        FROM presentation_sessions ps JOIN users u ON ps.user_id = u.id
        ORDER BY timestamp DESC LIMIT 20
        """
    )
    activity_logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return activity_logs

# =========================================================
# LEARNER STATS & ACHIEVEMENTS
# =========================================================

@app.get("/learner/stats")
def get_learner_stats(current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Aggregate 5-dimension scores
    cursor.execute(
        """
        SELECT 
            AVG(argument_quality) as arg, AVG(evidence_usage) as ev,
            AVG(logical_consistency) as logic, AVG(rebuttal_effectiveness) as rebuttal,
            AVG(communication_skills) as comm, AVG(overall_score) as overall,
            COUNT(*) as total_sessions
        FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        WHERE ds.user_id = ?
        """,
        (current_user["id"],)
    )
    row = cursor.fetchone()
    
    scores = {
        "argument_quality": round(row["arg"], 1) if row["arg"] else 0,
        "evidence_usage": round(row["ev"], 1) if row["ev"] else 0,
        "logical_consistency": round(row["logic"], 1) if row["logic"] else 0,
        "rebuttal_effectiveness": round(row["rebuttal"], 1) if row["rebuttal"] else 0,
        "communication_skills": round(row["comm"], 1) if row["comm"] else 0,
        "overall_score": round(row["overall"], 1) if row["overall"] else 0,
        "total_sessions": row["total_sessions"] or 0
    }
    
    # Score trend (chronological)
    cursor.execute(
        """
        SELECT ps.overall_score as score, ds.topic, ds.created_at
        FROM performance_scores ps
        JOIN debate_sessions ds ON ps.session_id = ds.id
        WHERE ds.user_id = ?
        ORDER BY ds.id ASC
        """,
        (current_user["id"],)
    )
    trend = []
    for idx, r in enumerate(cursor.fetchall()):
        topic = r["topic"] if r["topic"] else f"Session {idx+1}"
        label = topic[:20] + "..." if len(topic) > 20 else topic
        trend.append({"score": r["score"], "label": label})
    
    # Presentation stats
    cursor.execute(
        """
        SELECT COUNT(*) as count, AVG(pa.confidence_score) as avg_confidence
        FROM presentation_sessions ps
        JOIN presentation_analyses pa ON ps.id = pa.presentation_id
        WHERE ps.user_id = ?
        """,
        (current_user["id"],)
    )
    pres_row = cursor.fetchone()
    
    conn.close()
    return {
        "scores": scores,
        "trend": trend,
        "presentations": {
            "count": pres_row["count"] or 0,
            "avg_confidence": round(pres_row["avg_confidence"], 1) if pres_row["avg_confidence"] else 0
        }
    }

@app.get("/learner/achievements")
def get_learner_achievements(current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check existing achievements
    cursor.execute("SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC", (current_user["id"],))
    existing = [dict(a) for a in cursor.fetchall()]
    existing_types = {a["type"] for a in existing}
    
    # Calculate new achievements based on activity
    cursor.execute("SELECT COUNT(*) FROM debate_sessions WHERE user_id = ? AND status = 'completed'", (current_user["id"],))
    debate_count = cursor.fetchone()[0]
    
    cursor.execute(
        "SELECT MAX(ps.overall_score) FROM performance_scores ps JOIN debate_sessions ds ON ps.session_id = ds.id WHERE ds.user_id = ?",
        (current_user["id"],)
    )
    max_score_row = cursor.fetchone()
    max_score = max_score_row[0] if max_score_row and max_score_row[0] else 0
    
    cursor.execute("SELECT COUNT(*) FROM presentation_sessions WHERE user_id = ?", (current_user["id"],))
    pres_count = cursor.fetchone()[0]
    
    # Define achievement rules
    milestones = [
        {"type": "first_debate", "title": "First Debate", "desc": "Completed your first debate session", "condition": debate_count >= 1},
        {"type": "debate_5", "title": "Debate Enthusiast", "desc": "Completed 5 debate sessions", "condition": debate_count >= 5},
        {"type": "debate_10", "title": "Debate Veteran", "desc": "Completed 10 debate sessions", "condition": debate_count >= 10},
        {"type": "score_80", "title": "High Performer", "desc": "Scored 80% or higher in a debate", "condition": max_score >= 80},
        {"type": "score_90", "title": "Debate Master", "desc": "Scored 90% or higher in a debate", "condition": max_score >= 90},
        {"type": "first_presentation", "title": "First Speech", "desc": "Analyzed your first presentation", "condition": pres_count >= 1},
    ]
    
    # Award new achievements
    for m in milestones:
        if m["condition"] and m["type"] not in existing_types:
            cursor.execute(
                "INSERT INTO achievements (user_id, type, title, description) VALUES (?, ?, ?, ?)",
                (current_user["id"], m["type"], m["title"], m["desc"])
            )
            existing_types.add(m["type"])
    
    conn.commit()
    
    # Re-fetch all achievements
    cursor.execute("SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC", (current_user["id"],))
    achievements = [dict(a) for a in cursor.fetchall()]
    conn.close()
    return achievements

# =========================================================
# COACH FEEDBACK ENDPOINTS
# =========================================================

class CoachFeedbackCreate(BaseModel):
    feedback_type: str = "general"
    content: str
    exercises: str = ""

@app.post("/coach/learners/{learner_id}/feedback")
def create_coach_feedback(learner_id: int, payload: CoachFeedbackCreate, current_user=Depends(require_role(["Coach", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    
    if current_user["role"] != "Admin":
        cursor.execute("SELECT id FROM coach_learner_assignments WHERE coach_id = ? AND learner_id = ?", (current_user["id"], learner_id))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=403, detail="Not assigned to this learner")
    
    cursor.execute(
        "INSERT INTO coach_feedback (coach_id, learner_id, feedback_type, content, exercises) VALUES (?, ?, ?, ?, ?)",
        (current_user["id"], learner_id, payload.feedback_type, payload.content, payload.exercises)
    )
    conn.commit()
    
    # Notify learner
    create_notification(conn, learner_id, "New Coach Feedback", f"Your coach sent you feedback: {payload.content[:80]}...")
    conn.close()
    return {"message": "Feedback submitted successfully"}

@app.get("/coach/learners/{learner_id}/feedback")
def get_coach_feedback(learner_id: int, current_user=Depends(require_role(["Coach", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT cf.*, u.username as coach_name FROM coach_feedback cf
        JOIN users u ON cf.coach_id = u.id
        WHERE cf.learner_id = ?
        ORDER BY cf.created_at DESC
        """,
        (learner_id,)
    )
    feedback = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return feedback

# =========================================================
# EDUCATOR TOPIC ANALYTICS
# =========================================================

@app.get("/educator/topic-analytics")
def get_educator_topic_analytics(current_user=Depends(require_role(["Educator", "Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        """
        SELECT ds.topic, COUNT(*) as count, AVG(ps.overall_score) as avg_score
        FROM debate_sessions ds
        JOIN class_members cm ON ds.user_id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        LEFT JOIN performance_scores ps ON ds.id = ps.session_id
        WHERE c.educator_id = ?
        GROUP BY ds.topic
        ORDER BY count DESC
        LIMIT 10
        """,
        (current_user["id"],)
    )
    topics = [dict(r) for r in cursor.fetchall()]
    
    # Participation rate
    cursor.execute(
        "SELECT COUNT(DISTINCT cm.learner_id) FROM class_members cm JOIN classes c ON cm.class_id = c.id WHERE c.educator_id = ?",
        (current_user["id"],)
    )
    total_students = cursor.fetchone()[0]
    
    cursor.execute(
        """
        SELECT COUNT(DISTINCT ds.user_id) FROM debate_sessions ds
        JOIN class_members cm ON ds.user_id = cm.learner_id
        JOIN classes c ON cm.class_id = c.id
        WHERE c.educator_id = ?
        """,
        (current_user["id"],)
    )
    active_students = cursor.fetchone()[0]
    
    conn.close()
    return {
        "topics": topics,
        "participation": {
            "total": total_students,
            "active": active_students,
            "rate": round((active_students / max(1, total_students)) * 100, 1)
        }
    }

# =========================================================
# ADMIN SYSTEM HEALTH & COST ESTIMATION
# =========================================================

@app.get("/admin/system-health")
def get_system_health(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    
    # DB size
    db_size = os.path.getsize("debate.db") if os.path.exists("debate.db") else 0
    
    # Total tables stats
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM debate_sessions")
    total_sessions = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM debate_turns")
    total_turns = cursor.fetchone()[0]
    
    # Last AI success
    cursor.execute("SELECT timestamp FROM ai_request_logs WHERE success = 1 ORDER BY id DESC LIMIT 1")
    last_ai = cursor.fetchone()
    
    # Recent error rate (last 50 requests)
    cursor.execute("SELECT success FROM ai_request_logs ORDER BY id DESC LIMIT 50")
    recent = cursor.fetchall()
    recent_errors = sum(1 for r in recent if r[0] == 0)
    
    conn.close()
    return {
        "status": "healthy",
        "db_size_mb": round(db_size / (1024 * 1024), 2),
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_turns": total_turns,
        "last_ai_success": last_ai[0] if last_ai else None,
        "recent_error_rate": round((recent_errors / max(1, len(recent))) * 100, 1),
        "provider": os.getenv("LLM_PROVIDER", "mock"),
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    }

@app.get("/admin/cost-estimation")
def get_cost_estimation(current_user=Depends(require_role(["Admin"]))):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM ai_request_logs WHERE success = 1")
    successful = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM ai_request_logs")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(latency_ms) FROM ai_request_logs WHERE success = 1")
    total_latency = cursor.fetchone()[0] or 0
    
    # Estimated cost per request for Groq (free tier) vs OpenAI
    provider = os.getenv("LLM_PROVIDER", "mock")
    cost_per_request = 0.0
    if provider == "openai":
        cost_per_request = 0.002  # ~$0.002 per request estimate
    elif provider == "groq":
        cost_per_request = 0.0003  # ~$0.0003 per request estimate
    
    conn.close()
    return {
        "total_requests": total,
        "successful_requests": successful,
        "estimated_cost": round(successful * cost_per_request, 4),
        "cost_per_request": cost_per_request,
        "total_compute_ms": total_latency,
        "provider": provider
    }

# =========================================================
# MARK ALL NOTIFICATIONS READ
# =========================================================

@app.post("/notifications/read-all")
def mark_all_read(current_user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (current_user["id"],))
    conn.commit()
    conn.close()
    return {"message": "All notifications marked as read"}