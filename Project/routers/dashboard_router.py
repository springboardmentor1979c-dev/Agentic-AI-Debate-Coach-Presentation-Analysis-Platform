"""Dashboard Router — Role-specific analytics dashboards"""
from __future__ import annotations
from typing import Annotated
from fastapi import APIRouter, Depends

import database as db
from auth import get_current_user, require_role

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])


def _avg(values: list) -> float:
    return round(sum(values) / len(values), 2) if values else 0.0


@router.get("/learner")
def learner_dashboard(current_user: Annotated[dict, Depends(get_current_user)]):
    """Learner dashboard: debate history, performance trends, scores summary."""
    sessions = db.get_user_debate_sessions(current_user["id"])
    scores = db.get_user_scores(current_user["id"])
    notifications = db.get_user_notifications(current_user["id"])
    coaching = db.get_latest_coaching(current_user["id"])

    debate_scores = [s for s in scores if s.get("score_type") == "debate"]
    pres_scores = [s for s in scores if s.get("score_type") == "presentation"]

    avg_debate = _avg([s["weighted_total"] for s in debate_scores])
    avg_presentation = _avg([s["weighted_total"] for s in pres_scores])

    # Trend: last 5 scores
    trend = [{"date": s["created_at"], "score": s["weighted_total"], "type": s["score_type"]}
             for s in scores[:10]]

    return {
        "user": {"name": current_user["name"], "role": current_user["role"]},
        "stats": {
            "total_sessions": len(sessions),
            "active_sessions": sum(1 for s in sessions if s["status"] == "active"),
            "completed_sessions": sum(1 for s in sessions if s["status"] == "completed"),
            "avg_debate_score": avg_debate,
            "avg_presentation_score": avg_presentation,
            "total_scores_recorded": len(scores),
        },
        "recent_sessions": sessions[:5],
        "recent_scores": scores[:5],
        "performance_trend": trend,
        "unread_notifications": sum(1 for n in notifications if not n["is_read"]),
        "has_coaching_report": coaching is not None,
    }


@router.get("/coach")
def coach_dashboard(
    current_user: Annotated[dict, Depends(require_role("coach", "admin"))],
):
    """Coach dashboard: student overview, progress, skill gaps."""
    all_users = db.get_all_users()
    learners = [u for u in all_users if u["role"] == "learner"]
    all_scores = db.get_all_scores()

    # Group scores by user
    user_score_map: dict[int, list] = {}
    for s in all_scores:
        user_score_map.setdefault(s["user_id"], []).append(s)

    student_summaries = []
    for learner in learners:
        uid = learner["id"]
        user_scores = user_score_map.get(uid, [])
        debate_avg = _avg([s["weighted_total"] for s in user_scores if s.get("score_type") == "debate"])
        student_summaries.append({
            "user_id": uid,
            "name": learner["name"],
            "email": learner["email"],
            "debate_avg_score": debate_avg,
            "total_scores": len(user_scores),
            "performance_level": user_scores[0]["performance_level"] if user_scores else "Beginner",
        })

    # Sort by score descending
    student_summaries.sort(key=lambda x: x["debate_avg_score"], reverse=True)

    return {
        "coach": {"name": current_user["name"]},
        "total_students": len(learners),
        "student_summaries": student_summaries,
        "platform_avg_score": _avg([s["weighted_total"] for s in all_scores if s.get("score_type") == "debate"]),
    }


@router.get("/educator")
def educator_dashboard(
    current_user: Annotated[dict, Depends(require_role("educator", "admin"))],
):
    """Educator dashboard: class analytics, rankings, reports."""
    all_users = db.get_all_users()
    all_scores = db.get_all_scores()

    learners = [u for u in all_users if u["role"] == "learner"]
    debate_scores = [s for s in all_scores if s.get("score_type") == "debate"]
    pres_scores = [s for s in all_scores if s.get("score_type") == "presentation"]

    # Grade distribution
    grade_dist: dict[str, int] = {}
    for s in debate_scores:
        g = s.get("grade", "N/A")
        grade_dist[g] = grade_dist.get(g, 0) + 1

    # Rankings
    user_score_map: dict[int, list] = {}
    for s in debate_scores:
        user_score_map.setdefault(s["user_id"], []).append(s["weighted_total"])
    rankings = sorted(
        [{"user_id": uid, "avg_score": _avg(scores)} for uid, scores in user_score_map.items()],
        key=lambda x: x["avg_score"],
        reverse=True,
    )[:10]

    return {
        "educator": {"name": current_user["name"]},
        "class_stats": {
            "total_learners": len(learners),
            "total_debate_scores": len(debate_scores),
            "total_presentation_scores": len(pres_scores),
            "class_avg_debate_score": _avg([s["weighted_total"] for s in debate_scores]),
            "class_avg_presentation_score": _avg([s["weighted_total"] for s in pres_scores]),
        },
        "grade_distribution": grade_dist,
        "top_10_rankings": rankings,
    }


@router.get("/admin")
def admin_dashboard(
    current_user: Annotated[dict, Depends(require_role("admin"))],
):
    """Admin dashboard: user management, platform analytics, system stats."""
    all_users = db.get_all_users()
    all_scores = db.get_all_scores()

    role_counts: dict[str, int] = {}
    for u in all_users:
        role_counts[u["role"]] = role_counts.get(u["role"], 0) + 1

    return {
        "admin": {"name": current_user["name"]},
        "platform_stats": {
            "total_users": len(all_users),
            "users_by_role": role_counts,
            "total_scores_recorded": len(all_scores),
            "avg_platform_score": _avg([s["weighted_total"] for s in all_scores]),
        },
        "recent_users": all_users[-10:],
        "recent_scores": all_scores[:10],
    }
