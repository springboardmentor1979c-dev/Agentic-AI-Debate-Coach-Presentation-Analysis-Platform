from datetime import datetime
from secrets import token_urlsafe
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, UserProfile
from schemas.schemas import UserRegister, TokenResponse, UserOut
from utils.auth import hash_password, verify_password, create_access_token, get_current_user
from config import (
    GITHUB_CLIENT_ID,
    GOOGLE_CLIENT_ID,
    OAUTH_REDIRECT_BASE_URL,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # auto-create empty profile
    db.add(UserProfile(user_id=user.id))
    db.commit()
    return user


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user.last_login = datetime.utcnow()
    db.commit()
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/oauth/{provider}/start")
def oauth_start(provider: str):
    """Return an OAuth2 authorization URL for supported identity providers."""
    provider = provider.lower()
    state = token_urlsafe(24)
    redirect_uri = f"{OAUTH_REDIRECT_BASE_URL}/auth/oauth/{provider}/callback"

    if provider == "google":
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=501, detail="Google OAuth is not configured")
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        return {
            "provider": provider,
            "authorization_url": f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}",
            "state": state,
        }

    if provider == "github":
        if not GITHUB_CLIENT_ID:
            raise HTTPException(status_code=501, detail="GitHub OAuth is not configured")
        params = {
            "client_id": GITHUB_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "scope": "read:user user:email",
            "state": state,
        }
        return {
            "provider": provider,
            "authorization_url": f"https://github.com/login/oauth/authorize?{urlencode(params)}",
            "state": state,
        }

    raise HTTPException(status_code=400, detail="Supported OAuth providers: google, github")


@router.get("/oauth/{provider}/callback")
def oauth_callback(provider: str, code: str, state: str = ""):
    """OAuth callback placeholder for production identity integration."""
    if provider.lower() not in {"google", "github"}:
        raise HTTPException(status_code=400, detail="Supported OAuth providers: google, github")
    raise HTTPException(
        status_code=501,
        detail=(
            "OAuth authorization URL generation is enabled. Configure the provider "
            "token exchange and user-info verification before enabling callback login."
        ),
    )
