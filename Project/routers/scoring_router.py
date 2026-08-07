"""Performance Scoring Router"""
from __future__ import annotations
import json
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import database as db
from auth import get_current_user, require_role
from engines.scoring_engine import score_debate, score_presentation

router = APIRouter(prefix="/scoring", tags=["Performance Scoring"])


class DebateScoreIn(BaseModel):
    argument_quality: float = 5.0
    evidence_usage: float = 5.0
    logical_consistency: float = 5.0
    rebuttal_effectiveness: float = 5.0
    communication_skills: float = 5.0
    session_id: Optional[int] = None


class PresentationScoreIn(BaseModel):
    confidence: float = 5.0
    clarity: float = 5.0
    engagement: float = 5.0
    delivery: float = 5.0
    content_quality: float = 5.0


@router.post("/debate")
def submit_debate_score(
    payload: DebateScoreIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Compute and save a debate performance score."""
    result = score_debate(
        argument_quality=payload.argument_quality,
        evidence_usage=payload.evidence_usage,
        logical_consistency=payload.logical_consistency,
        rebuttal_effectiveness=payload.rebuttal_effectiveness,
        communication_skills=payload.communication_skills,
    )
    db.save_performance_score(
        user_id=current_user["id"],
        session_id=payload.session_id,
        score_type="debate",
        argument_quality=payload.argument_quality,
        evidence_usage=payload.evidence_usage,
        logical_consistency=payload.logical_consistency,
        rebuttal_effectiveness=payload.rebuttal_effectiveness,
        communication_skills=payload.communication_skills,
        weighted_total=result["weighted_total"],
        grade=result["grade"],
        performance_level=result["performance_level"],
        score_json=json.dumps(result),
    )
    # Achievement notification
    if result["weighted_total"] >= 8.0:
        db.create_notification(
            user_id=current_user["id"],
            title="🏆 Achievement Unlocked!",
            message=f"Excellent debate score: {result['weighted_total']}/10 — {result['badge']}",
            notif_type="achievement",
        )
    return result


@router.post("/presentation")
def submit_presentation_score(
    payload: PresentationScoreIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Compute and save a presentation performance score."""
    result = score_presentation(
        confidence=payload.confidence,
        clarity=payload.clarity,
        engagement=payload.engagement,
        delivery=payload.delivery,
        content_quality=payload.content_quality,
    )
    db.save_performance_score(
        user_id=current_user["id"],
        score_type="presentation",
        weighted_total=result["weighted_total"],
        grade=result["grade"],
        performance_level=result["performance_level"],
        score_json=json.dumps(result),
    )
    return result


@router.get("/history")
def get_my_score_history(current_user: Annotated[dict, Depends(get_current_user)]):
    """Get the current user's score history."""
    return db.get_user_scores(current_user["id"])


@router.get("/history/{user_id}")
def get_user_score_history(
    user_id: int,
    current_user: Annotated[dict, Depends(require_role("admin", "coach", "educator"))],
):
    """Get a specific user's score history (coach/educator/admin only)."""
    if not db.get_user_by_id(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return db.get_user_scores(user_id)
