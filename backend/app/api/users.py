from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.schemas_and_models import DBUser, DBUserProfile, UserOut, UserProfileSchema

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.get("/profile/{user_id}", response_model=UserOut)
async def get_user_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).filter(DBUser.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    p_res = await db.execute(select(DBUserProfile).filter(DBUserProfile.user_id == user_id))
    profile = p_res.scalars().first()
    
    if not profile:
        profile = DBUserProfile(user_id=user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return UserOut(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        avatar_url=user.avatar_url,
        profile=UserProfileSchema(
            experience_level=profile.experience_level,
            preferred_topics=profile.preferred_topics or [],
            presentation_domains=profile.presentation_domains or [],
            learning_goals=profile.learning_goals or [],
            coaching_preferences=profile.coaching_preferences,
            argument_quality_score=profile.argument_quality_score,
            evidence_usage_score=profile.evidence_usage_score,
            logical_consistency_score=profile.logical_consistency_score,
            rebuttal_effectiveness_score=profile.rebuttal_effectiveness_score,
            communication_skills_score=profile.communication_skills_score,
            overall_performance_score=profile.overall_performance_score
        )
    )

@router.put("/profile/{user_id}")
async def update_profile(user_id: int, data: UserProfileSchema, db: AsyncSession = Depends(get_db)):
    p_res = await db.execute(select(DBUserProfile).filter(DBUserProfile.user_id == user_id))
    profile = p_res.scalars().first()
    if not profile:
        profile = DBUserProfile(user_id=user_id)
        db.add(profile)

    profile.experience_level = data.experience_level
    profile.preferred_topics = data.preferred_topics
    profile.presentation_domains = data.presentation_domains
    profile.learning_goals = data.learning_goals
    profile.coaching_preferences = data.coaching_preferences
    
    await db.commit()
    return {"message": "Profile updated successfully"}
