from fastapi import APIRouter
from app.models.schemas_and_models import FallacyCheckRequest, FallacyCheckResponse
from app.services.ai_engines import detect_fallacies

router = APIRouter(prefix="/fallacies", tags=["Fallacy Engine"])

@router.post("/detect", response_model=FallacyCheckResponse)
async def detect_fallacies_endpoint(request: FallacyCheckRequest):
    return detect_fallacies(request.text)
