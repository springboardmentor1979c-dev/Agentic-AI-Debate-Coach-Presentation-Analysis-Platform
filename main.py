"""Authentication, role access, and profile APIs for Debate Coach."""

from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import json
import os
import secrets
from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from database import get_connection, init_db


app = FastAPI(title="AI Debate Coach API")
security_scheme = HTTPBearer(auto_error=False)

# Set JWT_SECRET_KEY in every non-development environment.  The fallback makes
# the starter project runnable locally but must never be used in production.
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "development-only-change-this-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = int(os.getenv("JWT_EXPIRY_MINUTES", "60"))
PASSWORD_ITERATIONS = 600_000


class Role(str, Enum):
    LEARNER = "Learner"
    COACH = "Coach"
    EDUCATOR = "Educator"
    ADMIN = "Admin"


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=8, max_length=128)
    role: Role = Role.LEARNER


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class ProfileInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    experience_level: str = Field(min_length=1, max_length=50)
    goals: list[str] = Field(default_factory=list, max_length=20)
    preferred_topics: list[str] = Field(default_factory=list, max_length=30)


class ProfileResponse(ProfileInput):
    username: str
    role: Role


class CurrentUser(BaseModel):
    id: int
    username: str
    role: Role


def _base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _base64url_decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        PASSWORD_ITERATIONS, _base64url_encode(salt), _base64url_encode(digest)
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected_digest = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), _base64url_decode(salt), int(iterations)
        )
        return hmac.compare_digest(_base64url_encode(candidate), expected_digest)
    except (ValueError, TypeError):
        return False


def create_access_token(user: CurrentUser) -> str:
    now = datetime.now(UTC)
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": user.username,
        "role": user.role.value,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRY_MINUTES)).timestamp()),
    }
    signing_input = "{}.{}".format(
        _base64url_encode(json.dumps(header, separators=(",", ":")).encode()),
        _base64url_encode(json.dumps(payload, separators=(",", ":")).encode()),
    )
    signature = hmac.new(JWT_SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    return "{}.{}".format(signing_input, _base64url_encode(signature))


def decode_access_token(token: str) -> dict:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
        header = json.loads(_base64url_decode(encoded_header))
        if header != {"alg": JWT_ALGORITHM, "typ": "JWT"}:
            raise ValueError("Unexpected JWT header")
        signing_input = f"{encoded_header}.{encoded_payload}"
        expected_signature = hmac.new(
            JWT_SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(_base64url_encode(expected_signature), encoded_signature):
            raise ValueError("Invalid JWT signature")
        payload = json.loads(_base64url_decode(encoded_payload))
        if not isinstance(payload, dict):
            raise ValueError("Invalid JWT payload")
        if not isinstance(payload.get("exp"), int) or payload["exp"] <= datetime.now(UTC).timestamp():
            raise ValueError("Expired JWT")
        if not isinstance(payload.get("sub"), str) or payload.get("role") not in Role._value2member_map_:
            raise ValueError("Invalid JWT claims")
        return payload
    except (ValueError, TypeError, binascii.Error, UnicodeDecodeError, json.JSONDecodeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)],
) -> CurrentUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    payload = decode_access_token(credentials.credentials)
    with get_connection() as connection:
        user = connection.execute(
            "SELECT id, username, role FROM users WHERE username = ?", (payload["sub"],)
        ).fetchone()
    if user is None or user["role"] != payload["role"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token user is no longer valid")
    return CurrentUser(id=user["id"], username=user["username"], role=user["role"])


def require_roles(*allowed_roles: Role):
    def role_guard(current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role permissions")
        return current_user

    return role_guard


def profile_from_row(row) -> ProfileResponse:
    return ProfileResponse(
        username=row["username"],
        role=row["role"],
        name=row["name"],
        experience_level=row["experience_level"],
        goals=json.loads(row["goals"]),
        preferred_topics=json.loads(row["preferred_topics"]),
    )


@app.on_event("startup")
def initialise_database() -> None:
    init_db()


@app.get("/")
def home():
    return {"message": "AI Debate Coach API is running"}


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister):
    with get_connection() as connection:
        try:
            connection.execute(
                "INSERT INTO users(username, password, role) VALUES (?, ?, ?)",
                (user.username, hash_password(user.password), user.role.value),
            )
        except Exception as error:
            # SQLite uses IntegrityError for an existing username; avoid exposing
            # lower-level database details through the API.
            if "UNIQUE constraint failed" in str(error):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
            raise
    return {"message": "User registered successfully", "username": user.username, "role": user.role}


@app.post("/login", response_model=TokenResponse)
def login(login_request: LoginRequest):
    with get_connection() as connection:
        user = connection.execute(
            "SELECT id, username, password, role FROM users WHERE username = ?", (login_request.username,)
        ).fetchone()
    if user is None or not verify_password(login_request.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_access_token(CurrentUser(id=user["id"], username=user["username"], role=user["role"]))
    return TokenResponse(access_token=token, expires_in=JWT_EXPIRY_MINUTES * 60)


@app.post("/profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile: ProfileInput, current_user: Annotated[CurrentUser, Depends(get_current_user)]
):
    with get_connection() as connection:
        try:
            connection.execute(
                """INSERT INTO user_profiles(user_id, name, experience_level, goals, preferred_topics)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    current_user.id,
                    profile.name,
                    profile.experience_level,
                    json.dumps(profile.goals),
                    json.dumps(profile.preferred_topics),
                ),
            )
        except Exception as error:
            if "UNIQUE constraint failed" in str(error):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists")
            raise
    return ProfileResponse(username=current_user.username, role=current_user.role, **profile.model_dump())


@app.get("/profile", response_model=ProfileResponse)
def get_my_profile(current_user: Annotated[CurrentUser, Depends(get_current_user)]):
    with get_connection() as connection:
        row = connection.execute(
            """SELECT u.username, u.role, p.name, p.experience_level, p.goals, p.preferred_topics
               FROM user_profiles p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?""",
            (current_user.id,),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile_from_row(row)


@app.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile: ProfileInput, current_user: Annotated[CurrentUser, Depends(get_current_user)]
):
    with get_connection() as connection:
        cursor = connection.execute(
            """UPDATE user_profiles
               SET name = ?, experience_level = ?, goals = ?, preferred_topics = ?, updated_at = CURRENT_TIMESTAMP
               WHERE user_id = ?""",
            (
                profile.name,
                profile.experience_level,
                json.dumps(profile.goals),
                json.dumps(profile.preferred_topics),
                current_user.id,
            ),
        )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return ProfileResponse(username=current_user.username, role=current_user.role, **profile.model_dump())


@app.get("/dashboard/learner")
def learner_dashboard(current_user: Annotated[CurrentUser, Depends(require_roles(Role.LEARNER))]):
    return {"message": "Learner dashboard access granted", "username": current_user.username}


@app.get("/dashboard/coach")
def coach_dashboard(current_user: Annotated[CurrentUser, Depends(require_roles(Role.COACH))]):
    return {"message": "Coach dashboard access granted", "username": current_user.username}


@app.get("/dashboard/educator")
def educator_dashboard(current_user: Annotated[CurrentUser, Depends(require_roles(Role.EDUCATOR))]):
    return {"message": "Educator dashboard access granted", "username": current_user.username}


@app.get("/admin/users")
def list_users(current_user: Annotated[CurrentUser, Depends(require_roles(Role.ADMIN))]):
    with get_connection() as connection:
        users = connection.execute("SELECT username, role FROM users ORDER BY username").fetchall()
    return {"users": [{"username": user["username"], "role": user["role"]} for user in users]}
