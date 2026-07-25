from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Profile
from app.schemas import ProfileCreate
from app.schemas import ProfileResponse
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.post("/")
def create_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    new_profile = Profile(
        name=profile.name,
        experience_level=profile.experience_level,
        goals=profile.goals,
        preferred_topics=profile.preferred_topics,
        user_id=current_user.id
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "message": "Profile Created Successfully"
    }


@router.get("/", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


@router.put("/")
def update_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    db_profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if db_profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    db_profile.name = profile.name
    db_profile.experience_level = profile.experience_level
    db_profile.goals = profile.goals
    db_profile.preferred_topics = profile.preferred_topics

    db.commit()

    return {
        "message": "Profile Updated Successfully"
    }