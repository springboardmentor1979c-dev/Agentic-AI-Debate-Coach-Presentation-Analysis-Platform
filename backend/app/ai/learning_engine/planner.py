import json
import logging
from typing import Dict, Any, List
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import LEARNING_PLAN
from backend.app.ai.models.schemas import LearningPlanResult

logger = logging.getLogger("debate_coach_learning")

class LearningEngine:
    def __init__(self):
        self.llm = get_llm()

    def generate_plan(self, weaknesses: List[str], goal: str, difficulty: str, duration_days: int = 7) -> Dict[str, Any]:
        """Generates a personalized learning plan based on weaknesses and goals."""
        weaknesses_str = ", ".join(weaknesses) if weaknesses else "General debate flow improvement"
        prompt = LEARNING_PLAN.replace("{weaknesses}", weaknesses_str)\
                              .replace("{goal}", goal)\
                              .replace("{difficulty}", difficulty)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            parsed = json.loads(response.content)
            parsed["duration_days"] = duration_days
            return parsed
        except Exception as e:
            logger.error(f"Failed to generate learning plan: {e}")
            return {
                "goal": goal,
                "difficulty": difficulty,
                "duration_days": duration_days,
                "weekly_plan": [
                    {
                        "week": 1,
                        "focus": "Argument Foundations",
                        "days": [
                            {"day": 1, "exercise": "Logicians review", "description": "Identify logical inconsistencies in an online debate transcript."},
                            {"day": 2, "exercise": "Stance construction", "description": "Write arguments supporting and opposing the same policy topic."}
                        ]
                    }
                ],
                "recommended_exercises": [
                    {
                        "name": "Stance Flip",
                        "exercise_type": "Critical Thinking",
                        "instructions": "Draft 3 core claims opposing your natural stance."
                    }
                ]
            }
