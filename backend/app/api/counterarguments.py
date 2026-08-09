from fastapi import APIRouter
from app.models.schemas_and_models import CounterargumentRequest, CounterargumentResponse
from app.services.ai_engines import generate_counterarguments

router = APIRouter(prefix="/counterarguments", tags=["Counterargument Engine"])

@router.post("/generate", response_model=CounterargumentResponse)
async def generate_counterarguments_endpoint(request: CounterargumentRequest):
    return generate_counterarguments(request.argument_text, request.topic, request.perspective or "All")
