"""Analytics & Insights — performance trends, skill gaps, platform metrics."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from models.models import User, DebateScore, PresentationAnalysis, DebateSession, Argument, RoleEnum
from utils.auth import get_current_user, require_roles
from services.cache import cache_get, cache_set

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])


@router.get("/performance")
def performance_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cache_key = f"analytics:perf:{current_user.id}:{days}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    since = datetime.utcnow() - timedelta(days=days)
    scores = db.query(DebateScore).filter(
        DebateScore.user_id == current_user.id,
        DebateScore.created_at >= since,
    ).order_by(DebateScore.created_at).all()

    presentations = db.query(PresentationAnalysis).filter(
        PresentationAnalysis.user_id == current_user.id,
        PresentationAnalysis.created_at >= since,
    ).order_by(PresentationAnalysis.created_at).all()

    debate_trend = [{"date": s.created_at.date().isoformat(), "score": s.overall_score} for s in scores]
    pres_trend = [{"date": p.created_at.date().isoformat(), "score": p.overall_score} for p in presentations]

    # Skill breakdown from latest score
    skill_breakdown = {}
    if scores:
        latest = scores[-1]
        skill_breakdown = {
            "argument_quality": latest.argument_quality,
            "evidence_usage": latest.evidence_usage,
            "logical_consistency": latest.logical_consistency,
            "rebuttal_effectiveness": latest.rebuttal_effectiveness,
            "communication_skills": latest.communication_skills,
        }

    # Improvement delta
    improvement = 0.0
    if len(scores) >= 2:
        improvement = round(scores[-1].overall_score - scores[0].overall_score, 2)

    result = {
        "period_days": days,
        "debate_trend": debate_trend,
        "presentation_trend": pres_trend,
        "skill_breakdown": skill_breakdown,
        "improvement_delta": improvement,
        "total_debates": len(scores),
        "total_presentations": len(presentations),
        "avg_debate_score": round(sum(s.overall_score for s in scores) / len(scores), 2) if scores else 0,
        "avg_presentation_score": round(sum(p.overall_score for p in presentations) / len(presentations), 2) if presentations else 0,
    }
    cache_set(cache_key, result, ttl=300)
    return result


@router.get("/class")
def class_analytics(
    current_user: User = Depends(require_roles(RoleEnum.educator, RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    """Educator view: class-wide performance analytics."""
    all_scores = db.query(DebateScore).all()
    user_map: dict[int, list] = {}
    for s in all_scores:
        user_map.setdefault(s.user_id, []).append(s.overall_score)

    rankings = sorted(
        [{"user_id": uid, "avg_score": round(sum(sc) / len(sc), 2), "sessions": len(sc)} for uid, sc in user_map.items()],
        key=lambda x: x["avg_score"],
        reverse=True,
    )

    platform_avg = round(sum(s.overall_score for s in all_scores) / len(all_scores), 2) if all_scores else 0

    return {
        "total_students": len(user_map),
        "platform_avg_score": platform_avg,
        "student_rankings": rankings[:20],
        "total_debate_sessions": db.query(DebateSession).count(),
        "total_presentations": db.query(PresentationAnalysis).count(),
    }


@router.get("/platform")
def platform_analytics(
    current_user: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    """Admin view: full platform analytics."""
    from models.models import AgentRun
    agent_runs = db.query(AgentRun).all()
    total_tokens = sum(r.tokens_used for r in agent_runs)
    avg_latency = round(sum(r.latency_ms for r in agent_runs) / len(agent_runs), 1) if agent_runs else 0

    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_debate_sessions": db.query(DebateSession).count(),
        "total_arguments": db.query(Argument).count(),
        "total_presentations": db.query(PresentationAnalysis).count(),
        "ai_agent_runs": len(agent_runs),
        "total_llm_tokens_used": total_tokens,
        "avg_agent_latency_ms": avg_latency,
    }
