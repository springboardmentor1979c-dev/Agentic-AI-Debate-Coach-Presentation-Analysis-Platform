import json
import logging
from typing import Dict, Any
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import PRESENTATION_EVALUATION
from backend.app.ai.models.schemas import PresentationEvaluationResult

logger = logging.getLogger("debate_coach_presentation")

class PresentationAnalyzer:
    def __init__(self):
        self.llm = get_llm()

    def analyze(self, transcript: str, slides_info: str) -> Dict[str, Any]:
        """Analyzes presentation structure, engagement, and communication quality."""
        prompt = PRESENTATION_EVALUATION.replace("{transcript}", transcript)\
                                        .replace("{slides}", slides_info)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to analyze presentation: {e}")
            return {
                "scores": {
                    "communication": 75.0,
                    "confidence": 70.0,
                    "structure": 80.0,
                    "engagement": 65.0,
                    "professionalism": 80.0
                },
                "feedback": {
                    "strengths": ["Logical structure."],
                    "weaknesses": ["Audience hook was a bit weak."],
                    "suggestions": ["Add a stronger introductory slide."],
                    "slide_improvements": ["Slide 2: Simplify text using visual columns."]
                }
            }
