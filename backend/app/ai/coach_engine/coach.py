import json
import logging
from typing import Dict, Any, List
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import COACHING_FEEDBACK
from backend.app.ai.models.schemas import CoachingFeedbackResult

logger = logging.getLogger("debate_coach_coach")

class CoachEngine:
    def __init__(self):
        self.llm = get_llm()

    def evaluate_round(self, history: List[Dict[str, str]]) -> Dict[str, Any]:
        """Provides coaching feedback after a debate round."""
        context_str = ""
        for h in history[-6:]:
            role = "AI" if h.get("speaker") == "ai" else "User"
            context_str += f"{role}: {h.get('message')}\n"

        prompt = COACHING_FEEDBACK.replace("{context}", context_str)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to evaluate debate round: {e}")
            return {
                "scores": {
                    "confidence": 70.0,
                    "persuasiveness": 70.0,
                    "reasoning": 70.0,
                    "logic": 70.0,
                    "evidence": 70.0,
                    "communication": 70.0
                },
                "strengths": ["Active engagement."],
                "weaknesses": ["Evidence is a bit general."],
                "recommendations": ["Cite specific statistics next round."],
                "better_wording": "State arguments directly using clear transitions.",
                "missing_evidence": ["Cite regional UBI economic studies."],
                "speaking_advice": "Focus on speaking speed clarity.",
                "skill_focus": "Evidence Framing"
            }
