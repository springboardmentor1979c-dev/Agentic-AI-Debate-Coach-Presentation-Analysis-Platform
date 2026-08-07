from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

import database as db
from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from models import RegisterRequest, Token, UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    """
    Any role may be self-registered. Promoting to admin is a separate admin-only operation.
    """
    if db.get_user_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = db.create_user(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    return user


@router.post("/login", response_model=Token)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """OAuth2-compatible login. Send `username` (= email) + `password` as form data."""
    user = db.get_user_by_email(form_data.username)  # OAuth2 spec uses 'username' field
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: Annotated[dict, Depends(get_current_user)]):
    return current_user
