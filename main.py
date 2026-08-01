"""JWT authenticated, role-aware FastAPI service."""

import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import os
import secrets
from typing import Callable, Literal

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from pydantic import BaseModel, Field

from database import connection_scope, initialize_database


Role = Literal["Learner", "Coach", "Educator", "Admin"]
VALID_ROLES = {"Learner", "Coach", "Educator", "Admin"}
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret-before-production")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_MINUTES = 60
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/oauth2/login")

app = FastAPI(title="Learning Platform API")

# The companion browser client may run from a different local port during
# development. Keep the API accessible without weakening authenticated routes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return {"access_token": create_access_token(user["id"], user["role"]), "token_type": "bearer", "role": user["role"]}


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
