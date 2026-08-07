"""Reports & Export Router"""
from __future__ import annotations
import json
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

import database as db
from auth import get_current_user, require_role

router = APIRouter(prefix="/reports", tags=["Reports & Export"])


def _build_debate_report(session_id: int, current_user: dict) -> dict:
    session = db.get_debate_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["user_id"] != current_user["id"] and current_user["role"] not in ("admin", "coach", "educator"):
        raise HTTPException(status_code=403, detail="Access denied")

    arguments = db.get_session_arguments(session_id)
    scores = [s for s in db.get_user_scores(session["user_id"]) if s.get("session_id") == session_id]

    analyses = []
    for arg in arguments:
        analysis = {}
        if arg.get("analysis_json"):
            try:
                analysis = json.loads(arg["analysis_json"])
            except Exception:
                pass
        analyses.append({"argument": arg, "analysis": analysis})

    return {
        "report_type": "debate_session",
        "session": session,
        "arguments_with_analysis": analyses,
        "session_scores": scores,
        "summary": {
            "total_arguments": len(arguments),
            "avg_argument_quality": round(
                sum(a["analysis"].get("overall", 0) for a in analyses) / max(len(analyses), 1), 2
            ),
        },
    }


@router.get("/debate/{session_id}")
def debate_report(
    session_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Generate a full debate session report with argument analysis."""
    return _build_debate_report(session_id, current_user)


@router.get("/performance/{user_id}")
def performance_report(
    user_id: int,
    current_user: Annotated[dict, Depends(require_role("admin", "coach", "educator"))],
):
    """Generate a complete performance report for a user (coach/admin only)."""
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    scores = db.get_user_scores(user_id)
    sessions = db.get_user_debate_sessions(user_id)
    coaching = db.get_latest_coaching(user_id)

    debate_scores = [s for s in scores if s.get("score_type") == "debate"]
    pres_scores = [s for s in scores if s.get("score_type") == "presentation"]

    def _avg(vals):
        return round(sum(vals) / len(vals), 2) if vals else 0.0

    trend = []
    for s in scores[-20:]:
        trend.append({"date": s["created_at"], "score": s["weighted_total"], "type": s["score_type"]})

    return {
        "report_type": "user_performance",
        "user": {"id": user_id, "name": user["name"], "email": user["email"]},
        "summary": {
            "total_debate_sessions": len(sessions),
            "avg_debate_score": _avg([s["weighted_total"] for s in debate_scores]),
            "avg_presentation_score": _avg([s["weighted_total"] for s in pres_scores]),
            "best_debate_score": max((s["weighted_total"] for s in debate_scores), default=0),
            "total_arguments_submitted": sum(
                len(db.get_session_arguments(s["id"])) for s in sessions[:10]
            ),
        },
        "score_history": scores[:20],
        "performance_trend": trend,
        "latest_coaching": json.loads(coaching["report_json"]) if coaching else None,
    }


@router.get("/my-performance")
def my_performance_report(current_user: Annotated[dict, Depends(get_current_user)]):
    """Get the current user's own performance summary report."""
    scores = db.get_user_scores(current_user["id"])
    sessions = db.get_user_debate_sessions(current_user["id"])
    coaching = db.get_latest_coaching(current_user["id"])

    debate_scores = [s for s in scores if s.get("score_type") == "debate"]
    pres_scores = [s for s in scores if s.get("score_type") == "presentation"]

    def _avg(vals):
        return round(sum(vals) / len(vals), 2) if vals else 0.0

    return {
        "report_type": "personal_performance",
        "summary": {
            "total_debate_sessions": len(sessions),
            "avg_debate_score": _avg([s["weighted_total"] for s in debate_scores]),
            "avg_presentation_score": _avg([s["weighted_total"] for s in pres_scores]),
            "best_grade": min((s["grade"] for s in debate_scores), default="N/A"),
        },
        "score_history": scores,
        "sessions": sessions,
        "has_coaching": coaching is not None,
    }
