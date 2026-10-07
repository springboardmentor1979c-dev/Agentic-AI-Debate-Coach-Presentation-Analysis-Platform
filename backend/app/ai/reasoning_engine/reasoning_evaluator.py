import json
import logging
from typing import Dict, Any
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import REASONING_EVALUATION
from backend.app.ai.models.schemas import ReasoningEvaluationResult

logger = logging.getLogger("debate_coach_reasoning")

class ReasoningEvaluator:
    def __init__(self):
        self.llm = get_llm()

    def evaluate(self, text: str) -> Dict[str, Any]:
        """Evaluates logical flow, validity, coherence, and consistency."""
        prompt = REASONING_EVALUATION.replace("{text}", text)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to evaluate reasoning: {e}")
            return {
                "logical_flow": "Heuristic fallback evaluation.",
                "consistency": "Heuristic fallback consistency check.",
                "validity": "Valid under default assumptions.",
                "coherence": "Coherent flow.",
                "reasoning_chain": [text],
                "overall_quality": "Average"
            }
