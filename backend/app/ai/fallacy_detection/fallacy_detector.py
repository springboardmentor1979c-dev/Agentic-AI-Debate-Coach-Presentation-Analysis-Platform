import json
import logging
from typing import Dict, Any, List
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import FALLACY_DETECTION
from backend.app.ai.models.schemas import FallacyDetectionResult

logger = logging.getLogger("debate_coach_fallacy")

class FallacyDetector:
    def __init__(self):
        self.llm = get_llm()

    def detect(self, text: str) -> List[Dict[str, Any]]:
        """Detects logical fallacies in argument text."""
        prompt = FALLACY_DETECTION.replace("{text}", text)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            parsed = json.loads(response.content)
            return parsed.get("fallacies", [])
        except Exception as e:
            logger.error(f"Failed to detect fallacies: {e}")
            return []
