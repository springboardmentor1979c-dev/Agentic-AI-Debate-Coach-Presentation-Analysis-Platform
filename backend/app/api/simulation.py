from fastapi import APIRouter
from app.models.schemas_and_models import DebateTurnRequest, DebateTurnResponse
from app.services.ai_engines import process_debate_turn

router = APIRouter(prefix="/simulation", tags=["AI Debate Simulator"])

@router.post("/turn", response_model=DebateTurnResponse)
async def debate_turn_endpoint(request: DebateTurnRequest):
    return process_debate_turn(request)
