from fastapi import APIRouter
from app.models.schemas_and_models import PresentationSpeechRequest, PresentationSpeechResponse
from app.services.ai_engines import analyze_speech

router = APIRouter(prefix="/presentations", tags=["Presentation Engine"])

@router.post("/analyze-speech", response_model=PresentationSpeechResponse)
async def analyze_speech_endpoint(request: PresentationSpeechRequest):
    return analyze_speech(
        transcript=request.transcript,
        title=request.title or "Keynote Speech",
        domain=request.domain or "Public Speaking",
        duration_seconds=request.duration_seconds or 120.0
    )
