"""JWT authenticated, role-aware FastAPI service."""

import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import os
import secrets
from typing import Callable, Literal, List

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from pydantic import BaseModel, Field

from database import connection_scope, initialize_database
from argument_engine import ArgumentAnalysisEngine
from counterargument_engine import CounterargumentEngine
from presentation_engine import PresentationAnalysisEngine
from simulation_engine import AIDebateSimulationEngine
from scoring_engine import PerformanceScoringEngine
from coaching_engine import RecommendationCoachingEngine
from analytics_engine import DashboardAnalyticsEngine
from report_exporter import ReportExportSystem
from notification_system import NotificationEngagementSystem

argument_analyzer = ArgumentAnalysisEngine()
counter_engine = CounterargumentEngine()
presentation_analyzer = PresentationAnalysisEngine()
simulation_engine = AIDebateSimulationEngine()
scoring_engine = PerformanceScoringEngine()
coaching_engine = RecommendationCoachingEngine()
analytics_engine = DashboardAnalyticsEngine()
report_exporter = ReportExportSystem()
notification_system = NotificationEngagementSystem()


Role = Literal["Learner", "Coach", "Educator", "Admin"]
VALID_ROLES = {"Learner", "Coach", "Educator", "Admin"}
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret-before-production")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_MINUTES = 60
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/oauth2/login")

import logging
import time as _time

# --- Logging & Monitoring Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("orator.api")

app = FastAPI(
    title="Orator - Agentic AI Debate Coach & Presentation Analysis Platform",
    description="Full-stack platform providing argument analysis, logical fallacy detection, counterargument generation, presentation analytics, AI debate simulation, performance scoring, personalized coaching, and report export.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# The companion browser client may run from a different local port during
# development. Keep the API accessible without weakening authenticated routes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request Logging & Performance Monitoring Middleware ---
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        start = _time.perf_counter()
        response = await call_next(request)
        elapsed_ms = round((_time.perf_counter() - start) * 1000, 1)
        logger.info(f"{request.method} {request.url.path} → {response.status_code} ({elapsed_ms}ms)")
        response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
        return response

app.add_middleware(RequestLoggingMiddleware)


# --- Health Check & System Status Endpoint ---
@app.get("/health", tags=["System"])
def health_check():
    """Production health check endpoint for Docker HEALTHCHECK, load balancers, and uptime monitors."""
    return {
        "status": "healthy",
        "service": "Orator Debate Coach API",
        "version": "2.4.0",
        "engines": {
            "argument_analyzer": "operational",
            "counter_engine": "operational",
            "presentation_analyzer": "operational",
            "simulation_engine": "operational",
            "scoring_engine": "operational",
            "coaching_engine": "operational",
            "analytics_engine": "operational",
            "report_exporter": "operational",
            "notification_system": "operational",
        },
    }


@app.get("/system/status", tags=["System"])
def system_status():
    """Detailed system status for monitoring dashboards."""
    with connection_scope() as connection:
        user_count = connection.execute("SELECT COUNT(*) as cnt FROM users").fetchone()["cnt"]
        analysis_count = connection.execute("SELECT COUNT(*) as cnt FROM argument_analyses").fetchone()["cnt"]
    return {
        "platform": "Orator Agentic AI Debate Coach",
        "version": "2.4.0",
        "database": "SQLite WAL Active",
        "total_users": user_count,
        "total_analyses": analysis_count,
        "uptime_target": "99.98%",
    }


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=128)
    role: Role = "Learner"


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    experience: str = Field(min_length=1, max_length=500)
    goals: str = Field(min_length=1, max_length=1000)
    preferred_topics: list[str] = Field(min_length=1)
    presentation_domains: list[str] = Field(default_factory=list)
    coaching_preference: str = Field(default="Self-guided", min_length=1, max_length=100)


class SkillsRequest(BaseModel):
    clarity: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    argumentation: int = Field(ge=0, le=100)
    rebuttal: int = Field(ge=0, le=100)
    delivery: int = Field(ge=0, le=100)


class GoalRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    target_date: str | None = Field(default=None, max_length=20)


class GoalUpdateRequest(BaseModel):
    completed: bool


class DebateRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=300)
    position: str = Field(min_length=1, max_length=100)
    score: int | None = Field(default=None, ge=0, le=100)
    feedback: str | None = Field(default=None, max_length=2000)


class PresentationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    domain: str = Field(min_length=1, max_length=150)
    score: int | None = Field(default=None, ge=0, le=100)
    feedback: str | None = Field(default=None, max_length=2000)


DebateFormat = Literal[
    "One-on-One",
    "Parliamentary",
    "Oxford",
    "Policy",
    "Public Forum",
    "AI Debate Simulation",
]
SessionStatus = Literal["draft", "scheduled", "in_progress", "completed", "cancelled"]

DEBATE_FORMATS: dict[str, dict] = {
    "One-on-One": {
        "description": "Two speakers take opposing sides in a focused clash.",
        "positions": ["Affirmative", "Negative"],
        "supports_ai": False,
    },
    "Parliamentary": {
        "description": "Government and Opposition teams argue a motion under parliamentary rules.",
        "positions": ["Government", "Opposition"],
        "supports_ai": False,
    },
    "Oxford": {
        "description": "Proposition and Opposition deliver formal speeches with audience voting.",
        "positions": ["Proposition", "Opposition"],
        "supports_ai": False,
    },
    "Policy": {
        "description": "Affirmative and Negative teams clash over a policy plan and its impacts.",
        "positions": ["Affirmative", "Negative"],
        "supports_ai": False,
    },
    "Public Forum": {
        "description": "Partner teams argue current events for a lay audience.",
        "positions": ["Pro", "Con"],
        "supports_ai": False,
    },
    "AI Debate Simulation": {
        "description": "Practice against an AI opponent that argues the opposite side.",
        "positions": ["For", "Against"],
        "supports_ai": True,
    },
}


class ParticipantInput(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    position: str = Field(min_length=1, max_length=100)
    is_ai: bool = False
    user_id: int | None = None


class DebateSessionRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=2000)
    format: DebateFormat
    scheduled_at: str | None = Field(default=None, max_length=40)
    status: SessionStatus = "scheduled"
    recording_notes: str | None = Field(default=None, max_length=5000)
    recording_url: str | None = Field(default=None, max_length=500)
    participants: list[ParticipantInput] = Field(default_factory=list)


class DebateSessionUpdateRequest(BaseModel):
    topic: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=2000)
    format: DebateFormat | None = None
    scheduled_at: str | None = Field(default=None, max_length=40)
    status: SessionStatus | None = None
    recording_notes: str | None = Field(default=None, max_length=5000)
    recording_url: str | None = Field(default=None, max_length=500)
    participants: list[ParticipantInput] | None = None


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256$310000${_b64encode(salt)}${_b64encode(digest)}"


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False
    try:
        _, rounds, salt, expected = stored_hash.split("$")
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), _b64decode(salt), int(rounds))
        return hmac.compare_digest(actual, _b64decode(expected))
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int, role: str) -> str:
    header = _b64encode(json.dumps({"alg": JWT_ALGORITHM, "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64encode(json.dumps({"sub": str(user_id), "role": role, "exp": int((datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRY_MINUTES)).timestamp())}, separators=(",", ":")).encode())
    signature = _b64encode(hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
    return f"{header}.{payload}.{signature}"


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        header, payload, signature = credentials.credentials.split(".")
        expected = _b64encode(hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
        claims = json.loads(_b64decode(payload))
        if not hmac.compare_digest(signature, expected) or claims["role"] not in VALID_ROLES or claims["exp"] <= datetime.now(timezone.utc).timestamp():
            raise ValueError
        with connection_scope() as connection:
            user = connection.execute("SELECT id, name, email, role FROM users WHERE id = ?", (int(claims["sub"]),)).fetchone()
        if user is None or user["role"] != claims["role"]:
            raise ValueError
        return dict(user)
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")


def require_roles(*roles: str) -> Callable:
    def authorization(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role permissions")
        return user
    return authorization


@app.on_event("startup")
def startup() -> None:
    initialize_database()


@app.get("/")
def hello():
    return {"message": "Learning Platform API"}


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest):
    with connection_scope() as connection:
        try:
            cursor = connection.execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                (request.name, request.email.lower(), hash_password(request.password), request.role),
            )
        except Exception as error:
            if "UNIQUE constraint failed" in str(error):
                raise HTTPException(status_code=409, detail="Email is already registered")
            raise
    return {"id": cursor.lastrowid, "name": request.name, "email": request.email.lower(), "role": request.role}


@app.post("/auth/login")
def login(request: LoginRequest):
    with connection_scope() as connection:
        user = connection.execute("SELECT * FROM users WHERE email = ?", (request.email.lower(),)).fetchone()
    if user is None or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return {"access_token": create_access_token(user["id"], user["role"]), "token_type": "bearer", "role": user["role"], "id": user["id"], "name": user["name"]}


@app.post("/auth/oauth2/login")
def oauth2_login(request: LoginRequest):
    """OAuth2-compatible bearer-token login for browser and API clients."""
    return login(request)


@app.put("/profile")
def create_or_update_profile(request: ProfileRequest, user: dict = Depends(get_current_user)):
    topics = json.dumps(request.preferred_topics)
    domains = json.dumps(request.presentation_domains)
    with connection_scope() as connection:
        connection.execute(
            """INSERT INTO user_profiles (user_id, name, experience, goals, preferred_topics, presentation_domains, coaching_preference)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, experience=excluded.experience,
               goals=excluded.goals, preferred_topics=excluded.preferred_topics,
               presentation_domains=excluded.presentation_domains, coaching_preference=excluded.coaching_preference""",
            (user["id"], request.name, request.experience, request.goals, topics, domains, request.coaching_preference),
        )
    payload = request.model_dump() if hasattr(request, "model_dump") else request.dict()
    return {"user_id": user["id"], **payload}


@app.get("/profile")
def read_profile(user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        profile = connection.execute("SELECT name, experience, goals, preferred_topics, presentation_domains, coaching_preference FROM user_profiles WHERE user_id = ?", (user["id"],)).fetchone()
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    result = dict(profile)
    result["preferred_topics"] = json.loads(result["preferred_topics"])
    result["presentation_domains"] = json.loads(result["presentation_domains"])
    return result


@app.get("/skills")
def read_skills(user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        skills = connection.execute("SELECT clarity, confidence, argumentation, rebuttal, delivery, updated_at FROM communication_skills WHERE user_id = ?", (user["id"],)).fetchone()
        if skills is None:
            connection.execute("INSERT INTO communication_skills (user_id) VALUES (?)", (user["id"],))
            skills = connection.execute("SELECT clarity, confidence, argumentation, rebuttal, delivery, updated_at FROM communication_skills WHERE user_id = ?", (user["id"],)).fetchone()
    return dict(skills)


@app.put("/skills")
def update_skills(request: SkillsRequest, user: dict = Depends(get_current_user)):
    values = request.model_dump() if hasattr(request, "model_dump") else request.dict()
    with connection_scope() as connection:
        connection.execute(
            """INSERT INTO communication_skills (user_id, clarity, confidence, argumentation, rebuttal, delivery, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(user_id) DO UPDATE SET clarity=excluded.clarity, confidence=excluded.confidence,
               argumentation=excluded.argumentation, rebuttal=excluded.rebuttal, delivery=excluded.delivery,
               updated_at=CURRENT_TIMESTAMP""",
            (user["id"], values["clarity"], values["confidence"], values["argumentation"], values["rebuttal"], values["delivery"]),
        )
    return values


@app.get("/learning-goals")
def list_learning_goals(user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        return [dict(row) for row in connection.execute("SELECT id, title, target_date, completed, created_at FROM learning_goals WHERE user_id = ? ORDER BY completed, id DESC", (user["id"],))]


@app.post("/learning-goals", status_code=status.HTTP_201_CREATED)
def create_learning_goal(request: GoalRequest, user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        cursor = connection.execute("INSERT INTO learning_goals (user_id, title, target_date) VALUES (?, ?, ?)", (user["id"], request.title, request.target_date))
        goal = connection.execute("SELECT id, title, target_date, completed, created_at FROM learning_goals WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return dict(goal)


@app.patch("/learning-goals/{goal_id}")
def update_learning_goal(goal_id: int, request: GoalUpdateRequest, user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        cursor = connection.execute("UPDATE learning_goals SET completed = ? WHERE id = ? AND user_id = ?", (int(request.completed), goal_id, user["id"]))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Learning goal not found")
    return {"id": goal_id, "completed": request.completed}


@app.get("/debates")
def list_debates(user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        return [dict(row) for row in connection.execute("SELECT id, topic, position, score, feedback, created_at FROM debate_history WHERE user_id = ? ORDER BY id DESC", (user["id"],))]


@app.post("/debates", status_code=status.HTTP_201_CREATED)
def create_debate(request: DebateRequest, user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        cursor = connection.execute("INSERT INTO debate_history (user_id, topic, position, score, feedback) VALUES (?, ?, ?, ?, ?)", (user["id"], request.topic, request.position, request.score, request.feedback))
        row = connection.execute("SELECT id, topic, position, score, feedback, created_at FROM debate_history WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return dict(row)


@app.get("/presentations")
def list_presentations(user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        return [dict(row) for row in connection.execute("SELECT id, title, domain, score, feedback, created_at FROM presentation_history WHERE user_id = ? ORDER BY id DESC", (user["id"],))]


@app.post("/presentations", status_code=status.HTTP_201_CREATED)
def create_presentation(request: PresentationRequest, user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        cursor = connection.execute("INSERT INTO presentation_history (user_id, title, domain, score, feedback) VALUES (?, ?, ?, ?, ?)", (user["id"], request.title, request.domain, request.score, request.feedback))
        row = connection.execute("SELECT id, title, domain, score, feedback, created_at FROM presentation_history WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return dict(row)


def _validate_participants(debate_format: str, participants: list[ParticipantInput]) -> None:
    meta = DEBATE_FORMATS[debate_format]
    allowed = set(meta["positions"])
    for participant in participants:
        if participant.position not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Position '{participant.position}' is invalid for {debate_format}. Allowed: {', '.join(meta['positions'])}",
            )
        if participant.is_ai and not meta["supports_ai"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"AI participants are only available for AI Debate Simulation",
            )


def _replace_participants(connection, session_id: int, participants: list[ParticipantInput], creator: dict, debate_format: str) -> None:
    connection.execute("DELETE FROM debate_session_participants WHERE session_id = ?", (session_id,))
    if not participants:
        positions = DEBATE_FORMATS[debate_format]["positions"]
        participants = [ParticipantInput(display_name=creator["name"], position=positions[0], user_id=creator["id"])]
        if debate_format == "AI Debate Simulation":
            participants.append(ParticipantInput(display_name="AI Opponent", position=positions[1], is_ai=True))
    for participant in participants:
        connection.execute(
            """INSERT INTO debate_session_participants (session_id, user_id, display_name, position, is_ai)
               VALUES (?, ?, ?, ?, ?)""",
            (session_id, participant.user_id, participant.display_name, participant.position, int(participant.is_ai)),
        )


def _session_payload(connection, session_id: int) -> dict:
    session = connection.execute(
        """SELECT id, creator_id, topic, description, format, scheduled_at, status,
                  recording_notes, recording_url, created_at, updated_at
           FROM debate_sessions WHERE id = ?""",
        (session_id,),
    ).fetchone()
    if session is None:
        raise HTTPException(status_code=404, detail="Debate session not found")
    participants = [
        dict(row)
        for row in connection.execute(
            """SELECT id, user_id, display_name, position, is_ai
               FROM debate_session_participants WHERE session_id = ? ORDER BY id""",
            (session_id,),
        )
    ]
    for participant in participants:
        participant["is_ai"] = bool(participant["is_ai"])
    payload = dict(session)
    payload["participants"] = participants
    payload["format_meta"] = DEBATE_FORMATS[payload["format"]]
    return payload


def _get_owned_session(connection, session_id: int, user_id: int):
    session = connection.execute(
        "SELECT id, creator_id, format FROM debate_sessions WHERE id = ? AND creator_id = ?",
        (session_id, user_id),
    ).fetchone()
    if session is None:
        raise HTTPException(status_code=404, detail="Debate session not found")
    return session


@app.get("/debate-formats")
def list_debate_formats(user: dict = Depends(get_current_user)):
    return [
        {"format": name, **meta}
        for name, meta in DEBATE_FORMATS.items()
    ]


@app.get("/debate-sessions")
def list_debate_sessions(user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        rows = connection.execute(
            """SELECT id FROM debate_sessions
               WHERE creator_id = ?
                  OR id IN (SELECT session_id FROM debate_session_participants WHERE user_id = ?)
               ORDER BY COALESCE(scheduled_at, created_at) DESC, id DESC""",
            (user["id"], user["id"]),
        ).fetchall()
        return [_session_payload(connection, row["id"]) for row in rows]


@app.post("/debate-sessions", status_code=status.HTTP_201_CREATED)
def create_debate_session(request: DebateSessionRequest, user: dict = Depends(get_current_user)):
    _validate_participants(request.format, request.participants)
    with connection_scope() as connection:
        cursor = connection.execute(
            """INSERT INTO debate_sessions
               (creator_id, topic, description, format, scheduled_at, status, recording_notes, recording_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user["id"],
                request.topic,
                request.description,
                request.format,
                request.scheduled_at,
                request.status,
                request.recording_notes,
                request.recording_url,
            ),
        )
        session_id = cursor.lastrowid
        _replace_participants(connection, session_id, request.participants, user, request.format)
        return _session_payload(connection, session_id)


@app.get("/debate-sessions/{session_id}")
def get_debate_session(session_id: int, user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        session = connection.execute(
            """SELECT id FROM debate_sessions
               WHERE id = ? AND (creator_id = ? OR id IN (
                   SELECT session_id FROM debate_session_participants WHERE user_id = ?
               ))""",
            (session_id, user["id"], user["id"]),
        ).fetchone()
        if session is None:
            raise HTTPException(status_code=404, detail="Debate session not found")
        return _session_payload(connection, session_id)


@app.patch("/debate-sessions/{session_id}")
def update_debate_session(session_id: int, request: DebateSessionUpdateRequest, user: dict = Depends(get_current_user)):
    values = request.model_dump(exclude_unset=True) if hasattr(request, "model_dump") else request.dict(exclude_unset=True)
    allowed_fields = {"topic", "description", "format", "scheduled_at", "status", "recording_notes", "recording_url"}
    with connection_scope() as connection:
        owned = _get_owned_session(connection, session_id, user["id"])
        debate_format = values.get("format", owned["format"])
        participants = values.pop("participants", None)
        participant_models = None
        if participants is not None:
            participant_models = [ParticipantInput(**item) if isinstance(item, dict) else item for item in participants]
            _validate_participants(debate_format, participant_models)
        field_updates = {key: value for key, value in values.items() if key in allowed_fields}
        if field_updates:
            assignments = ", ".join(f"{key} = ?" for key in field_updates)
            connection.execute(
                f"UPDATE debate_sessions SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (*field_updates.values(), session_id),
            )
        if participant_models is not None:
            _replace_participants(connection, session_id, participant_models, user, debate_format)
            connection.execute("UPDATE debate_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
        return _session_payload(connection, session_id)


@app.delete("/debate-sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_debate_session(session_id: int, user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        _get_owned_session(connection, session_id, user["id"])
        connection.execute("DELETE FROM debate_session_participants WHERE session_id = ?", (session_id,))
        connection.execute("DELETE FROM debate_sessions WHERE id = ?", (session_id,))
    return None


@app.get("/learner/dashboard")
def learner_dashboard(user: dict = Depends(require_roles("Learner"))):
    """Example endpoint available only to learners."""
    return {"message": f"Welcome, {user['name']}", "role": user["role"]}


@app.get("/guidance/learners")
def learner_guidance(user: dict = Depends(require_roles("Coach", "Educator"))):
    """Example endpoint shared by coaches and educators."""
    return {"message": "Learner guidance access granted", "role": user["role"]}


@app.get("/admin/users")
def list_users(_: dict = Depends(require_roles("Admin"))):
    with connection_scope() as connection:
            return [dict(row) for row in connection.execute("SELECT id, name, email, role FROM users")]


ROLE_VISIBILITY = {
    "Admin": ("Learner", "Coach", "Educator"),
    "Educator": ("Learner", "Coach"),
    "Coach": ("Learner",),
}


@app.get("/management/overview")
def management_overview(user: dict = Depends(require_roles("Admin", "Educator", "Coach"))):
    """Show each management role the accounts in the levels below it."""
    visible_roles = ROLE_VISIBILITY[user["role"]]
    placeholders = ", ".join("?" for _ in visible_roles)
    with connection_scope() as connection:
        users = [dict(row) for row in connection.execute(
            f"SELECT id, name, email, role FROM users WHERE role IN ({placeholders}) ORDER BY role, name",
            visible_roles,
        )]
    counts = {role: 0 for role in visible_roles}
    for account in users:
        counts[account["role"]] += 1
    return {"viewer_role": user["role"], "counts": counts, "users": users}


class ArgumentAnalysisRequest(BaseModel):
    title: str = Field(default="Speech Analysis", min_length=1, max_length=200)
    topic: str | None = Field(default=None, max_length=300)
    speech_text: str = Field(min_length=5, max_length=15000)


@app.post("/argument-analysis/analyze", status_code=status.HTTP_201_CREATED)
def analyze_argument(request: ArgumentAnalysisRequest, user: dict = Depends(get_current_user)):
    """Analyze speech text for argument structure, claims, evidence, fallacies, and 5 criteria."""
    result = argument_analyzer.analyze(text=request.speech_text, topic=request.topic)
    scores = result["scores"]
    credibility = result["credibility"]
    analysis_json_str = json.dumps(result)

    with connection_scope() as connection:
        cursor = connection.execute(
            """INSERT INTO argument_analyses (
                user_id, title, topic, speech_text, overall_score, clarity_score,
                relevance_score, evidence_score, logic_score, persuasiveness_score,
                credibility_score, credibility_level, analysis_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user["id"],
                request.title,
                request.topic,
                request.speech_text,
                scores["overall_strength"],
                scores["clarity"],
                scores["relevance"],
                scores["evidence_strength"],
                scores["logical_consistency"],
                scores["persuasiveness"],
                credibility["score"],
                credibility["level"],
                analysis_json_str,
            ),
        )
        record_id = cursor.lastrowid

    return {"id": record_id, "user_id": user["id"], "title": request.title, **result}


@app.get("/argument-analysis/history")
def list_argument_analyses(user: dict = Depends(get_current_user)):
    """List all saved argument analyses for the current user."""
    with connection_scope() as connection:
        rows = connection.execute(
            """SELECT id, title, topic, overall_score, clarity_score, relevance_score,
                      evidence_score, logic_score, persuasiveness_score, credibility_score,
                      credibility_level, created_at
               FROM argument_analyses WHERE user_id = ? ORDER BY id DESC""",
            (user["id"],),
        ).fetchall()
        return [dict(row) for row in rows]


@app.get("/argument-analysis/{analysis_id}")
def get_argument_analysis(analysis_id: int, user: dict = Depends(get_current_user)):
    """Retrieve full analysis report for a specific record."""
    with connection_scope() as connection:
        row = connection.execute(
            "SELECT * FROM argument_analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user["id"]),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Argument analysis record not found")
        data = dict(row)
        data["analysis_json"] = json.loads(data["analysis_json"])
        return data


@app.delete("/argument-analysis/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_argument_analysis(analysis_id: int, user: dict = Depends(get_current_user)):
    """Delete an argument analysis record."""
    with connection_scope() as connection:
        cursor = connection.execute(
            "DELETE FROM argument_analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user["id"]),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Argument analysis record not found")
    return None


class CounterargumentRequest(BaseModel):
    title: str = Field(default="Counter-Analysis", min_length=1, max_length=200)
    topic: str | None = Field(default=None, max_length=300)
    position: str | None = Field(default=None, max_length=100)
    argument_text: str = Field(min_length=5, max_length=15000)


@app.post("/counterarguments/generate", status_code=status.HTTP_201_CREATED)
def generate_counterarguments(request: CounterargumentRequest, user: dict = Depends(get_current_user)):
    """Generate rebuttals, counterpoints, alternative perspectives, challenge questions, and strategies."""
    result = counter_engine.generate(
        argument_text=request.argument_text, topic=request.topic, position=request.position,
    )
    report_json_str = json.dumps(result)
    strength = result["summary"]["counter_strength_score"]

    with connection_scope() as connection:
        cursor = connection.execute(
            """INSERT INTO counterargument_reports
               (user_id, title, topic, position, original_argument, counter_strength_score, report_json)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (user["id"], request.title, request.topic, request.position,
             request.argument_text, strength, report_json_str),
        )
        record_id = cursor.lastrowid

    return {"id": record_id, "user_id": user["id"], "title": request.title, **result}


@app.get("/counterarguments/history")
def list_counterargument_reports(user: dict = Depends(get_current_user)):
    """List all saved counterargument reports for the current user."""
    with connection_scope() as connection:
        rows = connection.execute(
            """SELECT id, title, topic, position, counter_strength_score, created_at
               FROM counterargument_reports WHERE user_id = ? ORDER BY id DESC""",
            (user["id"],),
        ).fetchall()
        return [dict(row) for row in rows]


@app.get("/counterarguments/{report_id}")
def get_counterargument_report(report_id: int, user: dict = Depends(get_current_user)):
    """Retrieve full counterargument report for a specific record."""
    with connection_scope() as connection:
        row = connection.execute(
            "SELECT * FROM counterargument_reports WHERE id = ? AND user_id = ?",
            (report_id, user["id"]),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Counterargument report not found")
        data = dict(row)
        data["report_json"] = json.loads(data["report_json"])
        return data


@app.delete("/counterarguments/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_counterargument_report(report_id: int, user: dict = Depends(get_current_user)):
    """Delete a counterargument report."""
    with connection_scope() as connection:
        cursor = connection.execute(
            "DELETE FROM counterargument_reports WHERE id = ? AND user_id = ?",
            (report_id, user["id"]),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Counterargument report not found")
    return None


class PresentationAnalysisRequest(BaseModel):
    title: str = Field(default="Presentation Speech Analysis", min_length=1, max_length=200)
    speech_text: str = Field(min_length=5, max_length=25000)
    duration_seconds: float | None = Field(default=None, ge=1.0, le=18000.0)


@app.post("/presentation/analyze", status_code=status.HTTP_201_CREATED)
def analyze_presentation(request: PresentationAnalysisRequest, user: dict = Depends(get_current_user)):
    """Analyze presentation speech for pace, filler words, confidence, clarity, and audience engagement."""
    result = presentation_analyzer.analyze(
        text=request.speech_text, duration_seconds=request.duration_seconds, title=request.title
    )
    analysis_json_str = json.dumps(result)
    metrics = result["metrics"]

    with connection_scope() as connection:
        cursor = connection.execute(
            """INSERT INTO presentation_analyses (
                user_id, title, speech_text, duration_seconds, wpm, pace_category,
                filler_count, filler_density, confidence_score, clarity_score,
                engagement_score, overall_score, analysis_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user["id"],
                request.title,
                request.speech_text,
                request.duration_seconds,
                metrics["speech_pace_wpm"],
                metrics["pace_category"],
                metrics["filler_word_count"],
                metrics["filler_density"],
                metrics["confidence_score"],
                metrics["clarity_score"],
                metrics["audience_engagement_score"],
                result["overall_score"],
                analysis_json_str,
            ),
        )
        record_id = cursor.lastrowid

    return {"id": record_id, "user_id": user["id"], "title": request.title, **result}


@app.get("/presentation/analyses")
def list_presentation_analyses(user: dict = Depends(get_current_user)):
    """List all saved presentation analyses for the current user."""
    with connection_scope() as connection:
        rows = connection.execute(
            """SELECT id, title, wpm, pace_category, filler_count, filler_density,
                      confidence_score, clarity_score, engagement_score, overall_score, created_at
               FROM presentation_analyses WHERE user_id = ? ORDER BY id DESC""",
            (user["id"],),
        ).fetchall()
        return [dict(row) for row in rows]


@app.get("/presentation/analyses/{analysis_id}")
def get_presentation_analysis(analysis_id: int, user: dict = Depends(get_current_user)):
    """Retrieve full presentation analysis report for a specific record."""
    with connection_scope() as connection:
        row = connection.execute(
            "SELECT * FROM presentation_analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user["id"]),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Presentation analysis record not found")
        data = dict(row)
        data["analysis_json"] = json.loads(data["analysis_json"])
        return data


@app.delete("/presentation/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_presentation_analysis(analysis_id: int, user: dict = Depends(get_current_user)):
    """Delete a presentation analysis record."""
    with connection_scope() as connection:
        cursor = connection.execute(
            "DELETE FROM presentation_analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user["id"]),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Presentation analysis record not found")
    return None


class StartSimulationRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=300)
    user_position: str = Field(default="For", min_length=1, max_length=50)
    opponent_persona: str | None = Field(default="socratic", max_length=50)


class SimulationTurnRequest(BaseModel):
    user_argument: str = Field(min_length=3, max_length=15000)


@app.post("/simulation/start", status_code=status.HTTP_201_CREATED)
def start_simulation(request: StartSimulationRequest, user: dict = Depends(get_current_user)):
    """Start a new AI debate simulation session with an AI opponent persona."""
    opponent = simulation_engine.generate_opponent(
        persona_key=request.opponent_persona, topic=request.topic, user_position=request.user_position
    )
    opponent_json_str = json.dumps(opponent)

    with connection_scope() as connection:
        cursor = connection.execute(
            """INSERT INTO debate_simulation_sessions (
                user_id, topic, user_position, opponent_persona, opponent_name, opponent_title, opponent_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                user["id"],
                request.topic,
                opponent["user_position"],
                opponent["persona_key"],
                opponent["name"],
                opponent["title"],
                opponent_json_str,
            ),
        )
        session_id = cursor.lastrowid

    return {
        "session_id": session_id,
        "user_id": user["id"],
        "topic": request.topic,
        "status": "in_progress",
        "opponent": opponent,
    }


@app.post("/simulation/sessions/{session_id}/turn", status_code=status.HTTP_201_CREATED)
def submit_simulation_turn(session_id: int, request: SimulationTurnRequest, user: dict = Depends(get_current_user)):
    """Submit a debate turn and receive AI opponent rebuttal, challenge, and coaching feedback."""
    with connection_scope() as connection:
        session = connection.execute(
            "SELECT * FROM debate_simulation_sessions WHERE id = ? AND user_id = ?",
            (session_id, user["id"]),
        ).fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Simulation session not found")
        if session["status"] == "completed":
            raise HTTPException(status_code=400, detail="Debate session is already completed.")

        opponent = json.loads(session["opponent_json"])
        current_turn = session["total_turns"] + 1

        history_rows = connection.execute(
            "SELECT turn_number, user_argument, ai_response FROM debate_simulation_turns WHERE session_id = ? ORDER BY turn_number ASC",
            (session_id,),
        ).fetchall()
        history = [dict(row) for row in history_rows]

        turn_result = simulation_engine.process_turn(
            topic=session["topic"],
            opponent=opponent,
            turn_number=current_turn,
            user_argument=request.user_argument,
            history=history,
        )

        coaching_json_str = json.dumps(turn_result["coaching_feedback"])

        cursor = connection.execute(
            """INSERT INTO debate_simulation_turns (
                session_id, turn_number, user_argument, ai_response, challenge_question, coaching_json
            ) VALUES (?, ?, ?, ?, ?, ?)""",
            (
                session_id,
                current_turn,
                request.user_argument,
                turn_result["ai_response"],
                turn_result["challenge_question"],
                coaching_json_str,
            ),
        )

        new_user_score = session["user_score"] + turn_result["coaching_feedback"]["turn_score"]
        connection.execute(
            "UPDATE debate_simulation_sessions SET total_turns = ?, user_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (current_turn, new_user_score, session_id),
        )

        return {"session_id": session_id, "turn": turn_result}


@app.get("/simulation/sessions")
def list_simulation_sessions(user: dict = Depends(get_current_user)):
    """List all AI debate simulation sessions for the current user."""
    with connection_scope() as connection:
        rows = connection.execute(
            """SELECT id, topic, user_position, opponent_persona, opponent_name, opponent_title,
                      status, total_turns, user_score, ai_score, created_at, updated_at
               FROM debate_simulation_sessions WHERE user_id = ? ORDER BY id DESC""",
            (user["id"],),
        ).fetchall()
        return [dict(row) for row in rows]


@app.get("/simulation/sessions/{session_id}")
def get_simulation_session(session_id: int, user: dict = Depends(get_current_user)):
    """Retrieve full simulation session transcript, turns, coaching history, and summary."""
    with connection_scope() as connection:
        session = connection.execute(
            "SELECT * FROM debate_simulation_sessions WHERE id = ? AND user_id = ?",
            (session_id, user["id"]),
        ).fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Simulation session not found")

        session_dict = dict(session)
        session_dict["opponent"] = json.loads(session_dict["opponent_json"])
        if session_dict["summary_json"]:
            session_dict["summary"] = json.loads(session_dict["summary_json"])

        turn_rows = connection.execute(
            "SELECT * FROM debate_simulation_turns WHERE session_id = ? ORDER BY turn_number ASC",
            (session_id,),
        ).fetchall()

        turns = []
        for r in turn_rows:
            d = dict(r)
            d["coaching_feedback"] = json.loads(d["coaching_json"])
            turns.append(d)

        session_dict["turns"] = turns
        return session_dict


@app.post("/simulation/sessions/{session_id}/complete")
def complete_simulation_session(session_id: int, user: dict = Depends(get_current_user)):
    """Complete a simulation session and calculate final transcript verdict."""
    with connection_scope() as connection:
        session = connection.execute(
            "SELECT * FROM debate_simulation_sessions WHERE id = ? AND user_id = ?",
            (session_id, user["id"]),
        ).fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Simulation session not found")

        opponent = json.loads(session["opponent_json"])
        turn_rows = connection.execute(
            "SELECT * FROM debate_simulation_turns WHERE session_id = ? ORDER BY turn_number ASC",
            (session_id,),
        ).fetchall()

        turns = []
        for r in turn_rows:
            d = dict(r)
            d["coaching_feedback"] = json.loads(d["coaching_json"])
            turns.append(d)

        summary = simulation_engine.generate_summary(
            topic=session["topic"], opponent=opponent, turns=turns
        )
        summary_json_str = json.dumps(summary)

        connection.execute(
            """UPDATE debate_simulation_sessions
               SET status = 'completed', user_score = ?, ai_score = ?, summary_json = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (summary["final_user_score"], summary["final_ai_score"], summary_json_str, session_id),
        )

        return {"session_id": session_id, "status": "completed", "summary": summary}


@app.delete("/simulation/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_simulation_session(session_id: int, user: dict = Depends(get_current_user)):
    """Delete a simulation session and its turn history."""
    with connection_scope() as connection:
        connection.execute("DELETE FROM debate_simulation_turns WHERE session_id = ?", (session_id,))
        cursor = connection.execute("DELETE FROM debate_simulation_sessions WHERE id = ? AND user_id = ?", (session_id, user["id"]))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Simulation session not found")
    return None


class PerformanceEvaluationRequest(BaseModel):
    title: str = Field(default="Performance Scorecard", min_length=1, max_length=200)
    speech_text: str | None = Field(default=None, max_length=25000)
    argument_quality: float | None = Field(default=None, ge=0.0, le=100.0)
    evidence_usage: float | None = Field(default=None, ge=0.0, le=100.0)
    logical_consistency: float | None = Field(default=None, ge=0.0, le=100.0)
    rebuttal_effectiveness: float | None = Field(default=None, ge=0.0, le=100.0)
    communication_skills: float | None = Field(default=None, ge=0.0, le=100.0)
    pace_delivery: float | None = Field(default=None, ge=0.0, le=100.0)
    confidence: float | None = Field(default=None, ge=0.0, le=100.0)
    clarity: float | None = Field(default=None, ge=0.0, le=100.0)
    engagement: float | None = Field(default=None, ge=0.0, le=100.0)


@app.post("/scoring/evaluate", status_code=status.HTTP_201_CREATED)
def evaluate_performance(request: PerformanceEvaluationRequest, user: dict = Depends(get_current_user)):
    """Evaluate performance metrics and generate weighted scorecard report."""
    result = scoring_engine.evaluate_performance(
        title=request.title,
        text=request.speech_text,
        argument_quality=request.argument_quality,
        evidence_usage=request.evidence_usage,
        logical_consistency=request.logical_consistency,
        rebuttal_effectiveness=request.rebuttal_effectiveness,
        communication_skills=request.communication_skills,
        pace_delivery=request.pace_delivery,
        confidence=request.confidence,
        clarity=request.clarity,
        engagement=request.engagement,
    )
    scorecard_json_str = json.dumps(result)
    scores = result["scores"]

    with connection_scope() as connection:
        cursor = connection.execute(
            """INSERT INTO performance_scorecards (
                user_id, title, debate_score, presentation_score, critical_thinking_score,
                communication_score, overall_performance_score, performance_tier, scorecard_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user["id"],
                request.title,
                scores["debate_performance"],
                scores["presentation_performance"],
                scores["critical_thinking"],
                scores["communication_effectiveness"],
                result["overall_performance_score"],
                result["performance_tier"],
                scorecard_json_str,
            ),
        )
        record_id = cursor.lastrowid

    return {"id": record_id, "user_id": user["id"], "title": request.title, **result}


@app.get("/scoring/scorecards")
def list_performance_scorecards(user: dict = Depends(get_current_user)):
    """List all saved performance scorecards for the current user."""
    with connection_scope() as connection:
        rows = connection.execute(
            """SELECT id, title, debate_score, presentation_score, critical_thinking_score,
                      communication_score, overall_performance_score, performance_tier, created_at
               FROM performance_scorecards WHERE user_id = ? ORDER BY id DESC""",
            (user["id"],),
        ).fetchall()
        return [dict(row) for row in rows]


@app.get("/scoring/scorecards/{card_id}")
def get_performance_scorecard(card_id: int, user: dict = Depends(get_current_user)):
    """Retrieve full performance scorecard report for a specific record."""
    with connection_scope() as connection:
        row = connection.execute(
            "SELECT * FROM performance_scorecards WHERE id = ? AND user_id = ?",
            (card_id, user["id"]),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Performance scorecard not found")
        data = dict(row)
        data["scorecard_json"] = json.loads(data["scorecard_json"])
        return data


@app.delete("/scoring/scorecards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_performance_scorecard(card_id: int, user: dict = Depends(get_current_user)):
    """Delete a performance scorecard."""
    with connection_scope() as connection:
        cursor = connection.execute(
            "DELETE FROM performance_scorecards WHERE id = ? AND user_id = ?",
            (card_id, user["id"]),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Performance scorecard not found")
    return None


class CoachingRequest(BaseModel):
    title: str = Field(default="Personalized Coaching Plan", min_length=1, max_length=200)
    experience_level: str = Field(default="Beginner", min_length=1, max_length=50)
    debate_score: float | None = Field(default=75.0, ge=0.0, le=100.0)
    presentation_score: float | None = Field(default=75.0, ge=0.0, le=100.0)
    recent_fallacies: List[str] | None = Field(default=None)
    filler_density: float | None = Field(default=0.0, ge=0.0, le=100.0)


@app.post("/coaching/generate", status_code=status.HTTP_201_CREATED)
def generate_coaching_plan(request: CoachingRequest, user: dict = Depends(get_current_user)):
    """Generate recommendations, personalized coaching feedback, skill development plans, and learning paths."""
    result = coaching_engine.generate_recommendations(
        debate_score=request.debate_score,
        presentation_score=request.presentation_score,
        recent_fallacies=request.recent_fallacies,
        filler_density=request.filler_density,
        user_role=user["role"],
        experience_level=request.experience_level,
    )
    plan_json_str = json.dumps(result)
    target_focus = result["learning_path"]["recommended_focus"]

    with connection_scope() as connection:
        cursor = connection.execute(
            """INSERT INTO coaching_plans (
                user_id, title, experience_level, target_focus, plan_json
            ) VALUES (?, ?, ?, ?, ?)""",
            (
                user["id"],
                request.title,
                request.experience_level,
                target_focus,
                plan_json_str,
            ),
        )
        record_id = cursor.lastrowid

    return {"id": record_id, "user_id": user["id"], "title": request.title, **result}


@app.get("/coaching/plans")
def list_coaching_plans(user: dict = Depends(get_current_user)):
    """List all saved coaching plans for the current user."""
    with connection_scope() as connection:
        rows = connection.execute(
            """SELECT id, title, experience_level, target_focus, created_at
               FROM coaching_plans WHERE user_id = ? ORDER BY id DESC""",
            (user["id"],),
        ).fetchall()
        return [dict(row) for row in rows]


@app.get("/coaching/plans/{plan_id}")
def get_coaching_plan(plan_id: int, user: dict = Depends(get_current_user)):
    """Retrieve full coaching plan for a specific record."""
    with connection_scope() as connection:
        row = connection.execute(
            "SELECT * FROM coaching_plans WHERE id = ? AND user_id = ?",
            (plan_id, user["id"]),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Coaching plan not found")
        data = dict(row)
        data["plan_json"] = json.loads(data["plan_json"])
        return data


@app.delete("/coaching/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coaching_plan(plan_id: int, user: dict = Depends(get_current_user)):
    """Delete a coaching plan."""
    with connection_scope() as connection:
        cursor = connection.execute(
            "DELETE FROM coaching_plans WHERE id = ? AND user_id = ?",
            (plan_id, user["id"]),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Coaching plan not found")
    return None


@app.get("/analytics/learner")
def learner_analytics(user: dict = Depends(get_current_user)):
    """Fetch complete Learner Dashboard analytics."""
    with connection_scope() as connection:
        return analytics_engine.get_learner_analytics(user["id"], connection)


@app.get("/analytics/coach")
def coach_analytics(user: dict = Depends(require_roles("Coach", "Admin"))):
    """Fetch Debate Coach Dashboard analytics (student progress, skill gaps, evaluations)."""
    with connection_scope() as connection:
        return analytics_engine.get_coach_analytics(user["id"], connection)


@app.get("/analytics/educator")
def educator_analytics(user: dict = Depends(require_roles("Educator", "Admin"))):
    """Fetch Educator Dashboard analytics (class analytics, student rankings, debate & presentation reports)."""
    with connection_scope() as connection:
        return analytics_engine.get_educator_analytics(user["id"], connection)


@app.get("/analytics/admin")
def admin_analytics(user: dict = Depends(require_roles("Admin"))):
    """Fetch Admin Dashboard analytics (user management, platform analytics, AI model health, system reports)."""
    with connection_scope() as connection:
        return analytics_engine.get_admin_analytics(user["id"], connection)


def _handle_report_response(data: dict, export_format: str, filename_prefix: str):
    """Helper to return JSON, Excel (CSV), or PDF response based on export_format."""
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])

    fmt = export_format.lower()
    if fmt == "excel":
        csv_data = report_exporter.export_excel(data)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename_prefix}.csv"},
        )
    elif fmt == "pdf":
        pdf_bytes = report_exporter.export_pdf(data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename_prefix}.pdf"},
        )
    return data


@app.get("/reports/debate/{analysis_id}")
def export_debate_report(analysis_id: int, export_format: str = "json", user: dict = Depends(get_current_user)):
    """Export Debate Analysis Report (JSON, Excel, PDF)."""
    with connection_scope() as connection:
        data = report_exporter.get_debate_report(analysis_id, connection)
        return _handle_report_response(data, export_format, f"debate_report_{analysis_id}")


@app.get("/reports/presentation/{analysis_id}")
def export_presentation_report(analysis_id: int, export_format: str = "json", user: dict = Depends(get_current_user)):
    """Export Presentation Analysis Report (JSON, Excel, PDF)."""
    with connection_scope() as connection:
        data = report_exporter.get_presentation_report(analysis_id, connection)
        return _handle_report_response(data, export_format, f"presentation_report_{analysis_id}")


@app.get("/reports/performance/{card_id}")
def export_performance_report(card_id: int, export_format: str = "json", user: dict = Depends(get_current_user)):
    """Export Performance Score Report (JSON, Excel, PDF)."""
    with connection_scope() as connection:
        data = report_exporter.get_performance_report(card_id, connection)
        return _handle_report_response(data, export_format, f"performance_scorecard_{card_id}")


@app.get("/reports/coaching/{plan_id}")
def export_coaching_report(plan_id: int, export_format: str = "json", user: dict = Depends(get_current_user)):
    """Export Coaching Report (JSON, Excel, PDF)."""
    with connection_scope() as connection:
        data = report_exporter.get_coaching_report(plan_id, connection)
        return _handle_report_response(data, export_format, f"coaching_plan_{plan_id}")


@app.get("/reports/learning-progress")
def export_learning_progress_report(export_format: str = "json", user: dict = Depends(get_current_user)):
    """Export Learning Progress Report (JSON, Excel, PDF)."""
    with connection_scope() as connection:
        data = report_exporter.get_learning_progress_report(user["id"], connection)
        return _handle_report_response(data, export_format, f"learning_progress_user_{user['id']}")


@app.get("/notifications")
def get_user_notifications(user: dict = Depends(get_current_user)):
    """Fetch Debate Reminders, Coaching Alerts, Practice Reminders, Milestones, and Announcements."""
    with connection_scope() as connection:
        return notification_system.get_user_notifications(user["id"], connection)


@app.post("/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: int, user: dict = Depends(get_current_user)):
    """Mark a notification as read."""
    with connection_scope() as connection:
        success = notification_system.mark_as_read(notification_id, user["id"], connection)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}







