from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

import database as db
from auth import get_current_user, require_role
from models import ProfileIn, ProfileOut

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/me", response_model=ProfileOut)
def get_my_profile(current_user: Annotated[dict, Depends(get_current_user)]):
    profile = db.get_profile_by_user(current_user["id"])
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Use PUT /profile/me to create one.",
        )
    return profile


@router.put("/me", response_model=ProfileOut)
def upsert_my_profile(
    payload: ProfileIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    return db.upsert_profile(
        user_id=current_user["id"],
        experience=payload.experience,
        goals=payload.goals,
        preferred_topics=payload.preferred_topics,
    )


@router.get(
    "/{user_id}",
    response_model=ProfileOut,
    dependencies=[Depends(require_role("admin", "educator"))],
)
def get_user_profile(user_id: int):
    if not db.get_user_by_id(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    profile = db.get_profile_by_user(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No profile for user {user_id}",
        )
    return profile
