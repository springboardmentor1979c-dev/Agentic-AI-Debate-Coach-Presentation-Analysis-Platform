"""Coaching & Recommendation engine — personalized AI mentor."""
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, UserProfile, DebateScore, PresentationAnalysis, CoachingPlan, SkillRecord
from utils.auth import get_current_user
from services.agent_orchestrator import coach_agent
from services.cache import cache_get, cache_set

router = APIRouter(prefix="/coaching", tags=["Coaching & Recommendations"])


@router.get("/plan")
def get_coaching_plan(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cache_key = f"coaching:{current_user.id}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    scores = db.query(DebateScore).filter(DebateScore.user_id == current_user.id).all()
    presentations = db.query(PresentationAnalysis).filter(PresentationAnalysis.user_id == current_user.id).all()

    avg_debate = round(sum(s.overall_score for s in scores) / len(scores), 2) if scores else 0
    avg_pres = round(sum(p.overall_score for p in presentations) / len(presentations), 2) if presentations else 0

    # Identify weak areas from scores
    weak_areas = []
    if scores:
        last = scores[-1]
        if last.argument_quality < 6: weak_areas.append("argument_quality")
        if last.evidence_usage < 6: weak_areas.append("evidence_usage")
        if last.rebuttal_effectiveness < 6: weak_areas.append("rebuttal")
        if last.communication_skills < 6: weak_areas.append("communication")

    user_history = {
        "experience_level": profile.experience_level if profile else "beginner",
        "avg_debate_score": avg_debate,
        "avg_presentation_score": avg_pres,
        "debate_count": len(scores),
        "weak_areas": ", ".join(weak_areas) or "none identified yet",
        "goals": profile.goals if profile else "",
    }

    plan_data = coach_agent(user_history, db)

    # Persist coaching plan
    plan = db.query(CoachingPlan).filter(CoachingPlan.user_id == current_user.id).first()
    if not plan:
        plan = CoachingPlan(user_id=current_user.id)
        db.add(plan)
    plan.focus_areas = ",".join(plan_data.get("focus_areas", []))
    plan.weekly_goals = plan_data.get("weekly_goals", "")
    plan.recommended_exercises = json.dumps(plan_data.get("recommended_exercises", []))
    plan.learning_path = json.dumps(plan_data.get("learning_path", []))
    plan.generated_by = "llm"
    db.commit()

    result = {
        "focus_areas": plan_data.get("focus_areas", []),
        "weekly_goals": plan_data.get("weekly_goals", ""),
        "recommended_exercises": plan_data.get("recommended_exercises", []),
        "learning_path": plan_data.get("learning_path", []),
        "motivational_message": plan_data.get("motivational_message", "Keep practicing — every debate makes you stronger!"),
        "current_stats": {"avg_debate_score": avg_debate, "avg_presentation_score": avg_pres, "sessions": len(scores)},
    }
    cache_set(cache_key, result, ttl=600)
    return result


@router.get("/skills")
def get_skill_tracking(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(SkillRecord).filter(SkillRecord.user_id == current_user.id).order_by(SkillRecord.recorded_at).all()
    skills: dict[str, list] = {}
    for r in records:
        skills.setdefault(r.skill_name, []).append({"score": r.score, "date": r.recorded_at.isoformat()})
    return {"skills": skills, "total_records": len(records)}


@router.get("/leaderboard")
def get_leaderboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from services.cache import leaderboard_get
    board = leaderboard_get(top_n=10)
    if not board:
        # Fallback: compute from DB
        scores = db.query(DebateScore).all()
        user_scores: dict[int, list] = {}
        for s in scores:
            user_scores.setdefault(s.user_id, []).append(s.overall_score)
        board = sorted(
            [{"user_id": uid, "score": round(sum(sc) / len(sc), 2)} for uid, sc in user_scores.items()],
            key=lambda x: x["score"],
            reverse=True,
        )[:10]
    return {"leaderboard": board}
