import json
import logging
from typing import Dict, Any
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import FEEDBACK_GENERATION
from backend.app.ai.models.schemas import FeedbackResult

logger = logging.getLogger("debate_coach_feedback")

class FeedbackGenerator:
    def __init__(self):
        self.llm = get_llm()

    def generate(self, text: str) -> Dict[str, Any]:
        """Generates strengths, weaknesses, missing evidence, and tips."""
        prompt = FEEDBACK_GENERATION.replace("{text}", text)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to generate feedback: {e}")
            return {
                "strengths": ["Clear delivery."],
                "weaknesses": ["Lack of specific details."],
                "missing_evidence": ["Statistical citation is needed."],
                "improvement_tips": ["Add expert opinions to support claims."]
            }
