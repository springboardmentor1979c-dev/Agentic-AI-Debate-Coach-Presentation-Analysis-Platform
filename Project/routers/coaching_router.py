"""Coaching & Recommendation Router"""
from __future__ import annotations
import json
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import database as db
from auth import get_current_user
from engines.coaching_engine import generate_coaching

router = APIRouter(prefix="/coaching", tags=["Coaching & Recommendations"])


class CoachingRequestIn(BaseModel):
    """Manual score input for coaching generation."""
    argument_quality: float = 5.0
    evidence_usage: float = 5.0
    logical_consistency: float = 5.0
    rebuttal_effectiveness: float = 5.0
    communication_skills: float = 5.0


@router.post("/generate")
def generate_coaching_report(
    payload: CoachingRequestIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Generate a personalized coaching report based on provided scores."""
    scores = {
        "argument_quality": payload.argument_quality,
        "evidence_usage": payload.evidence_usage,
        "logical_consistency": payload.logical_consistency,
        "rebuttal_effectiveness": payload.rebuttal_effectiveness,
        "communication_skills": payload.communication_skills,
    }
    report = generate_coaching(current_user["id"], scores)
    db.save_coaching(current_user["id"], json.dumps(report))
    # Notify user
    db.create_notification(
        user_id=current_user["id"],
        title="📚 New Coaching Report Ready",
        message="Your personalized coaching recommendations have been updated.",
        notif_type="info",
    )
    return report


@router.get("/recommendations")
def get_coaching_recommendations(current_user: Annotated[dict, Depends(get_current_user)]):
    """Get the latest coaching recommendations for the current user."""
    record = db.get_latest_coaching(current_user["id"])
    if not record:
        # Generate a default coaching report from average scores
        scores = {"argument_quality": 5, "evidence_usage": 5, "logical_consistency": 5,
                  "rebuttal_effectiveness": 5, "communication_skills": 5}
        report = generate_coaching(current_user["id"], scores)
        db.save_coaching(current_user["id"], json.dumps(report))
        return report
    return json.loads(record["report_json"])


@router.get("/learning-path")
def get_learning_path(current_user: Annotated[dict, Depends(get_current_user)]):
    """Get the personalized 4-week learning path."""
    record = db.get_latest_coaching(current_user["id"])
    if not record:
        raise HTTPException(status_code=404, detail="No coaching report found. Call POST /coaching/generate first.")
    report = json.loads(record["report_json"])
    return {"learning_path": report.get("learning_path", []), "motivational_message": report.get("motivational_message", "")}


@router.get("/auto")
def auto_coaching(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Automatically generate coaching from the user's latest performance scores.
    Falls back to average scores if no history exists.
    """
    scores_history = db.get_user_scores(current_user["id"], limit=10)
    if scores_history:
        # Average recent debate scores
        debate_scores = [s for s in scores_history if s.get("score_type") == "debate"]
        if debate_scores:
            keys = ["argument_quality", "evidence_usage", "logical_consistency",
                    "rebuttal_effectiveness", "communication_skills"]
            scores = {k: round(sum(s.get(k, 5) for s in debate_scores) / len(debate_scores), 2) for k in keys}
        else:
            scores = {k: 5.0 for k in ["argument_quality", "evidence_usage", "logical_consistency",
                                         "rebuttal_effectiveness", "communication_skills"]}
    else:
        scores = {k: 5.0 for k in ["argument_quality", "evidence_usage", "logical_consistency",
                                     "rebuttal_effectiveness", "communication_skills"]}

    report = generate_coaching(current_user["id"], scores)
    db.save_coaching(current_user["id"], json.dumps(report))
    return report
