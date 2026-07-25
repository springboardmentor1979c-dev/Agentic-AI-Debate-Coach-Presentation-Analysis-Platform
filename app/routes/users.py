from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin
from app.auth import hash_password, verify_password
from app.oauth2 import create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(tags=["Authentication"])



@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully"
    }



@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid Email")

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")

    token = create_access_token(
        {
            "user_id": db_user.id,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }   