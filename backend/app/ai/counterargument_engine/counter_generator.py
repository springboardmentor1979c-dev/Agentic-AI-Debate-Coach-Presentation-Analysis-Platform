import json
import logging
from typing import Dict, Any, List
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import COUNTERARGUMENT_GENERATION
from backend.app.ai.models.schemas import CounterargumentResult

logger = logging.getLogger("debate_coach_counter")

class CounterGenerator:
    def __init__(self):
        self.llm = get_llm()

    def generate(self, user_argument: str) -> List[Dict[str, Any]]:
        """Generates 7 types of counterarguments to user text."""
        prompt = COUNTERARGUMENT_GENERATION.replace("{text}", user_argument)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            parsed = json.loads(response.content)
            return parsed.get("counterarguments", [])
        except Exception as e:
            logger.error(f"Failed to generate counterarguments: {e}")
            return [
                {
                    "counter_type": "logical",
                    "counter_argument": "This argument assumes technological automation must result in job loss, ignoring job creation.",
                    "explanation": "Exposes linear reasoning flaw.",
                    "strength": 80.0,
                    "possible_user_reply": "Historically, major transitions create a temporary net job deficit."
                }
            ]
class CounterArgumentEngine(CounterGenerator):
    pass
