import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.models import User, Profile, RefreshToken
from backend.app.schemas.schemas import UserRegister, Token, UserResponse, UserLogin
from backend.app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from backend.app.core.dependencies import get_current_user
from jose import jwt, JWTError
from backend.app.core.config import settings

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    # Create User
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create associated empty Profile
    new_profile = Profile(
        user_id=new_user.id,
        experience_level="Beginner",
        preferred_topics="",
        presentation_domains="",
        learning_goals="",
        coaching_preferences=""
    )
    db.add(new_profile)
    db.commit()

    return new_user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Retrieve user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token(subject=user.email, role=user.role)
    refresh_token_jwt = create_refresh_token(subject=user.email)
    
    # Store refresh token in db
    payload = jwt.decode(refresh_token_jwt, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    exp_timestamp = payload.get("exp")
    expires_at = datetime.datetime.utcfromtimestamp(exp_timestamp)
    
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_jwt,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token_jwt,
        role=user.role
    )


# Also support JSON login for ease of React integration
@router.post("/login/json", response_model=Token)
def login_json(
    login_in: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.email, role=user.role)
    refresh_token_jwt = create_refresh_token(subject=user.email)
    
    payload = jwt.decode(refresh_token_jwt, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    exp_timestamp = payload.get("exp")
    expires_at = datetime.datetime.utcfromtimestamp(exp_timestamp)
    
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_jwt,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token_jwt,
        role=user.role
    )


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token_str: str,
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_token_str, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        if email is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Check refresh token in database
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token_str,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.datetime.utcnow()
    ).first()
    
    if not db_token:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise credentials_exception

    # Generate new tokens
    access_token = create_access_token(subject=user.email, role=user.role)
    new_refresh_token_jwt = create_refresh_token(subject=user.email)
    
    # Revoke old refresh token
    db_token.revoked = True
    
    # Save new refresh token
    new_payload = jwt.decode(new_refresh_token_jwt, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    exp_timestamp = new_payload.get("exp")
    expires_at = datetime.datetime.utcfromtimestamp(exp_timestamp)
    
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=new_refresh_token_jwt,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    db.commit()

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token_jwt,
        role=user.role
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    refresh_token_str: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token_str,
        RefreshToken.user_id == current_user.id
    ).first()
    
    if db_token:
        db_token.revoked = True
        db.commit()
        
    return {"detail": "Successfully logged out"}
