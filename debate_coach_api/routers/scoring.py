from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, DebateScore, RoleEnum, SkillRecord
from schemas.schemas import DebateScoreCreate, DebateScoreOut
from utils.auth import get_current_user, require_roles
from services.scoring import compute_debate_score, generate_recommendations, compute_percentile
from services.cache import cache_invalidate_user
from services.kafka_producer import publish_scoring_event

router = APIRouter(prefix="/scores", tags=["Scoring & Recommendations"])


@router.post("/debate", response_model=DebateScoreOut, status_code=201)
def score_debate(
    payload: DebateScoreCreate,
    current_user: User = Depends(require_roles(RoleEnum.coach, RoleEnum.educator, RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    score = DebateScore(**payload.model_dump())
    compute_debate_score(score, use_llm=True)

    # Compute percentile
    all_scores = [s.overall_score for s in db.query(DebateScore).all()]
    score.percentile_rank = compute_percentile(score.overall_score, all_scores)

    db.add(score)
    db.commit()
    db.refresh(score)

    # Track skill records
    db.add(SkillRecord(user_id=score.user_id, skill_name="argumentation", score=score.argument_quality, session_ref_id=score.session_id))
    db.add(SkillRecord(user_id=score.user_id, skill_name="logic", score=score.logical_consistency, session_ref_id=score.session_id))
    db.add(SkillRecord(user_id=score.user_id, skill_name="rebuttal", score=score.rebuttal_effectiveness, session_ref_id=score.session_id))
    db.commit()

    cache_invalidate_user(score.user_id)
    publish_scoring_event(score.session_id, score.user_id, score.overall_score)
    return score


@router.get("/debate/{session_id}", response_model=list[DebateScoreOut])
def get_debate_scores(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(DebateScore).filter(DebateScore.session_id == session_id).all()


@router.get("/recommendations/{session_id}/{user_id}")
def get_recommendations(
    session_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    score = db.query(DebateScore).filter(
        DebateScore.session_id == session_id,
        DebateScore.user_id == user_id,
    ).first()
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    return {
        "overall_score": score.overall_score,
        "percentile_rank": score.percentile_rank,
        "recommendations": generate_recommendations(score),
        "llm_feedback": score.llm_feedback,
    }
