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
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from database import connection_scope, initialize_database


Role = Literal["Learner", "Coach", "Educator", "Admin"]
VALID_ROLES = {"Learner", "Coach", "Educator", "Admin"}
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret-before-production")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_MINUTES = 60
security = HTTPBearer()

app = FastAPI(title="Learning Platform API")


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


@app.put("/profile")
def create_or_update_profile(request: ProfileRequest, user: dict = Depends(get_current_user)):
    topics = json.dumps(request.preferred_topics)
    with connection_scope() as connection:
        connection.execute(
            """INSERT INTO user_profiles (user_id, name, experience, goals, preferred_topics)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, experience=excluded.experience,
               goals=excluded.goals, preferred_topics=excluded.preferred_topics""",
            (user["id"], request.name, request.experience, request.goals, topics),
        )
    payload = request.model_dump() if hasattr(request, "model_dump") else request.dict()
    return {"user_id": user["id"], **payload}


@app.get("/profile")
def read_profile(user: dict = Depends(get_current_user)):
    with connection_scope() as connection:
        profile = connection.execute("SELECT name, experience, goals, preferred_topics FROM user_profiles WHERE user_id = ?", (user["id"],)).fetchone()
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    result = dict(profile)
    result["preferred_topics"] = json.loads(result["preferred_topics"])
    return result


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
