from fastapi import APIRouter
from app.models.schemas_and_models import ArgumentAnalysisRequest, ArgumentAnalysisResponse
from app.services.ai_engines import analyze_argument

router = APIRouter(prefix="/arguments", tags=["Argument Engine"])

@router.post("/analyze", response_model=ArgumentAnalysisResponse)
async def analyze_argument_endpoint(request: ArgumentAnalysisRequest):
    return analyze_argument(request.text, request.context_topic)
