from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from config import WHISPER_ENABLED
from database import get_db
from models.models import User, PresentationAnalysis, SkillRecord
from schemas.schemas import PresentationCreate, PresentationOut
from utils.auth import get_current_user
from services.presentation import analyze_presentation
from services.cache import cache_invalidate_user

router = APIRouter(prefix="/presentations", tags=["Presentation Analysis"])


def _save_presentation_analysis(
    db: Session,
    user_id: int,
    title: str,
    transcript: str,
) -> PresentationAnalysis:
    analysis = PresentationAnalysis(
        user_id=user_id,
        title=title,
        transcript=transcript,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    analyze_presentation(db, analysis, use_llm=True)

    db.add(SkillRecord(user_id=user_id, skill_name="delivery", score=analysis.confidence_score))
    db.add(SkillRecord(user_id=user_id, skill_name="clarity", score=analysis.clarity_score))
    db.commit()

    cache_invalidate_user(user_id)
    return analysis


@router.post("/", response_model=PresentationOut, status_code=201)
def submit_presentation(
    payload: PresentationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _save_presentation_analysis(db, current_user.id, payload.title, payload.transcript)


@router.post("/upload", response_model=PresentationOut, status_code=201)
async def upload_presentation_audio(
    title: str = Form("Untitled"),
    transcript: Optional[str] = Form(None),
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept an audio/video presentation submission.

    The platform can analyze a supplied transcript today. Set WHISPER_ENABLED=true
    and wire a transcription provider here to turn raw media into transcript text.
    """
    if not audio.content_type or not (
        audio.content_type.startswith("audio/") or audio.content_type.startswith("video/")
    ):
        raise HTTPException(status_code=400, detail="Upload an audio or video file")

    clean_transcript = (transcript or "").strip()
    if not clean_transcript:
        if WHISPER_ENABLED:
            raise HTTPException(status_code=501, detail="Whisper transcription provider is not wired yet")
        raise HTTPException(
            status_code=422,
            detail="Transcript is required until WHISPER_ENABLED transcription is configured",
        )

    analysis = _save_presentation_analysis(db, current_user.id, title, clean_transcript)
    analysis.feedback = (
        f"{analysis.feedback} Source media received: {audio.filename}. "
        "Transcript-based speech analytics completed."
    ).strip()
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/", response_model=list[PresentationOut])
def list_presentations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PresentationAnalysis).filter(PresentationAnalysis.user_id == current_user.id).all()


@router.get("/{presentation_id}", response_model=PresentationOut)
def get_presentation(presentation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PresentationAnalysis).filter(
        PresentationAnalysis.id == presentation_id,
        PresentationAnalysis.user_id == current_user.id,
    ).first()


@router.get("/{presentation_id}/coaching")
def get_presentation_coaching(presentation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return LLM-generated coaching tips for a presentation."""
    import json
    p = db.query(PresentationAnalysis).filter(
        PresentationAnalysis.id == presentation_id,
        PresentationAnalysis.user_id == current_user.id,
    ).first()
    if not p:
        return {"error": "Not found"}
    coaching = json.loads(p.llm_coaching) if p.llm_coaching else {}
    return {
        "title": p.title,
        "overall_score": p.overall_score,
        "coaching_tips": coaching.get("coaching_tips", []),
        "strengths": coaching.get("strengths", []),
        "improvement_areas": coaching.get("improvement_areas", []),
        "emotion_detected": p.emotion_detected,
        "filler_words": json.loads(p.filler_words_detail) if p.filler_words_detail else {},
    }
