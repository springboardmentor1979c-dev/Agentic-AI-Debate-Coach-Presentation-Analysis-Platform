import json
import logging
from typing import Dict, Any
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import ARGUMENT_IMPROVEMENT
from backend.app.ai.models.schemas import ImprovementResult

logger = logging.getLogger("debate_coach_improver")

class ArgumentImprover:
    def __init__(self):
        self.llm = get_llm()

    def improve(self, text: str) -> Dict[str, Any]:
        """Rewrites argument to improve grammar, logic, and structure while retaining meaning."""
        prompt = ARGUMENT_IMPROVEMENT.replace("{text}", text)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to improve argument: {e}")
            return {
                "improved_argument": text,
                "wording_tips": "Incorporate calibrated language.",
                "structural_tips": "State premise, cite data, and link to conclusion."
            }
