from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.models import User, Profile
from backend.app.schemas.schemas import UserProfileResponse, UserProfileUpdate
from backend.app.core.dependencies import get_current_user

router = APIRouter(tags=["User Profile"])

@router.get("/profile", response_model=UserProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Fail-safe: if profile was somehow not created during registration, create it now
    if not profile:
        profile = Profile(
            user_id=current_user.id,
            experience_level="Beginner",
            preferred_topics="",
            presentation_domains="",
            learning_goals="",
            coaching_preferences=""
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        name=current_user.name,
        email=current_user.email,
        experience_level=profile.experience_level,
        preferred_topics=profile.preferred_topics,
        presentation_domains=profile.presentation_domains,
        learning_goals=profile.learning_goals,
        coaching_preferences=profile.coaching_preferences
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    # Update user name if provided
    if profile_in.name is not None:
        current_user.name = profile_in.name
        db.add(current_user)

    # Update profile fields
    profile.experience_level = profile_in.experience_level
    profile.preferred_topics = profile_in.preferred_topics
    profile.presentation_domains = profile_in.presentation_domains
    profile.learning_goals = profile_in.learning_goals
    profile.coaching_preferences = profile_in.coaching_preferences
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    return UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        name=current_user.name,
        email=current_user.email,
        experience_level=profile.experience_level,
        preferred_topics=profile.preferred_topics,
        presentation_domains=profile.presentation_domains,
        learning_goals=profile.learning_goals,
        coaching_preferences=profile.coaching_preferences
    )


@router.delete("/profile", status_code=status.HTTP_200_OK)
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Deleting the user will cascade delete the profile and debate sessions
    db.delete(current_user)
    db.commit()
    return {"detail": "User account and profile successfully deleted"}
