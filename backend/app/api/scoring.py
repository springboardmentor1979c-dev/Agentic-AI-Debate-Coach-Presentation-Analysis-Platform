from fastapi import APIRouter
from app.models.schemas_and_models import ScoreCalculationRequest, ScoreCalculationResponse
from app.services.ai_engines import compute_performance_score

router = APIRouter(prefix="/scoring", tags=["Performance Scoring"])

@router.post("/calculate", response_model=ScoreCalculationResponse)
async def calculate_score_endpoint(request: ScoreCalculationRequest):
    return compute_performance_score(request)
