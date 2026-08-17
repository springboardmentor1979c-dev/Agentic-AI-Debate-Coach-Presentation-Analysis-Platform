from fastapi import APIRouter
from pydantic import BaseModel

from app.services.gemini_service import generate_debate_response

router = APIRouter(prefix="/ai", tags=["AI"])

class DebateRequest(BaseModel):
    topic: str
    stance: str
    user_message: str

@router.post("/chat")
def ai_chat(request: DebateRequest):

    reply = generate_debate_response(
        topic=request.topic,
        stance=request.stance,
        user_message=request.user_message,
    )

    return {
        "reply": reply
    }