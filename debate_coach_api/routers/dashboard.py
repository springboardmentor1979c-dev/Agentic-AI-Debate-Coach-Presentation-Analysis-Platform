from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, DebateScore, PresentationAnalysis, DebateSession, RoleEnum, AIDebateSession
from utils.auth import get_current_user, require_roles
from services.cache import cache_get, cache_set

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])


@router.get("/learner")
def learner_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cache_key = f"dashboard:{current_user.id}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    scores = db.query(DebateScore).filter(DebateScore.user_id == current_user.id).all()
    presentations = db.query(PresentationAnalysis).filter(PresentationAnalysis.user_id == current_user.id).all()
    ai_sessions = db.query(AIDebateSession).filter(AIDebateSession.user_id == current_user.id).all()

    avg_debate = round(sum(s.overall_score for s in scores) / len(scores), 2) if scores else 0
    avg_pres = round(sum(p.overall_score for p in presentations) / len(presentations), 2) if presentations else 0

    # Improvement trend: compare first half vs second half
    trend = "stable"
    if len(scores) >= 4:
        mid = len(scores) // 2
        first_half = sum(s.overall_score for s in scores[:mid]) / mid
        second_half = sum(s.overall_score for s in scores[mid:]) / (len(scores) - mid)
        trend = "improving" if second_half > first_half + 0.3 else ("declining" if second_half < first_half - 0.3 else "stable")

    result = {
        "user": current_user.name,
        "role": current_user.role,
        "debate_count": len(scores),
        "avg_debate_score": avg_debate,
        "presentation_count": len(presentations),
        "avg_presentation_score": avg_pres,
        "ai_debate_sessions": len(ai_sessions),
        "performance_trend": trend,
        "recent_scores": [{"session_id": s.session_id, "score": s.overall_score, "date": s.created_at.isoformat()} for s in scores[-5:]],
        "recent_presentations": [{"id": p.id, "title": p.title, "score": p.overall_score} for p in presentations[-3:]],
    }
    cache_set(cache_key, result, ttl=120)
    return result


@router.get("/coach")
def coach_dashboard(
    current_user: User = Depends(require_roles(RoleEnum.coach, RoleEnum.educator, RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    sessions = db.query(DebateSession).filter(DebateSession.creator_id == current_user.id).all()
    all_scores = db.query(DebateScore).all()
    user_progress: dict[int, list] = {}
    for s in all_scores:
        user_progress.setdefault(s.user_id, []).append(s.overall_score)

    return {
        "sessions_created": len(sessions),
        "total_evaluations": len(all_scores),
        "students_tracked": len(user_progress),
        "avg_platform_score": round(sum(s.overall_score for s in all_scores) / len(all_scores), 2) if all_scores else 0,
        "student_summaries": [
            {"user_id": uid, "sessions": len(sc), "avg_score": round(sum(sc) / len(sc), 2)}
            for uid, sc in list(user_progress.items())[:10]
        ],
    }


@router.get("/admin")
def admin_dashboard(
    current_user: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    from models.models import AgentRun, AuditLog
    users = db.query(User).all()
    agent_runs = db.query(AgentRun).all()

    return {
        "total_users": len(users),
        "by_role": {role: sum(1 for u in users if u.role == role) for role in ["learner", "coach", "educator", "admin"]},
        "active_users": sum(1 for u in users if u.is_active),
        "total_sessions": db.query(DebateSession).count(),
        "total_presentations": db.query(PresentationAnalysis).count(),
        "total_ai_debates": db.query(AIDebateSession).count(),
        "ai_agent_runs": len(agent_runs),
        "total_tokens_used": sum(r.tokens_used for r in agent_runs),
        "audit_log_count": db.query(AuditLog).count(),
    }
