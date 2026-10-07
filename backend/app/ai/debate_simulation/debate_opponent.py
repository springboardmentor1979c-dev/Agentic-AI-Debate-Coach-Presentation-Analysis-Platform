import json
import logging
from typing import Dict, Any, List
from backend.app.ai.utils.llm import get_llm
from backend.app.ai.prompts.prompt_templates import DEBATE_OPENING, REBUTTAL_GENERATION

logger = logging.getLogger("debate_coach_opponent")

class DebateOpponent:
    def __init__(self):
        self.llm = get_llm()

    def generate_opening(
        self,
        topic: str,
        format_name: str,
        stance: str,
        personality: str,
        difficulty: str
    ) -> Dict[str, Any]:
        """Generates opening statement for debate simulation."""
        prompt = DEBATE_OPENING.replace("{topic}", topic)\
                               .replace("{format}", format_name)\
                               .replace("{stance}", stance)\
                               .replace("{personality}", personality)\
                               .replace("{difficulty}", difficulty)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to generate debate opening: {e}")
            return {
                "opening_statement": f"We are affirming the stance on {topic}.",
                "key_points": [f"Relevance of {topic}", "Structural advantages"]
            }

    def generate_rebuttal(
        self,
        topic: str,
        format_name: str,
        stance: str,
        personality: str,
        difficulty: str,
        user_message: str,
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Generates rebuttal based on conversation history."""
        context_str = ""
        for h in history[-6:]:
            role = "AI" if h.get("speaker") == "ai" else "User"
            context_str += f"{role}: {h.get('message')}\n"
        context_str += f"User (latest): {user_message}\n"

        prompt = REBUTTAL_GENERATION.replace("{topic}", topic)\
                                    .replace("{format}", format_name)\
                                    .replace("{stance}", stance)\
                                    .replace("{personality}", personality)\
                                    .replace("{difficulty}", difficulty)\
                                    .replace("{context}", context_str)
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to generate rebuttal: {e}")
            return {
                "rebuttal": "I see your point, but we must look at the overall systemic feasibility.",
                "points_addressed": ["System feasibility"]
            }

    def generate_closing(
        self,
        topic: str,
        format_name: str,
        stance: str,
        personality: str,
        difficulty: str,
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Generates closing statement summarizing arguments."""
        context_str = ""
        for h in history[-8:]:
            role = "AI" if h.get("speaker") == "ai" else "User"
            context_str += f"{role}: {h.get('message')}\n"

        prompt = f"""
        You are an AI debate opponent in a {format_name} debate on "{topic}". Stance: {stance}, Personality: {personality}, Difficulty: {difficulty}.
        Given this debate history:
        {context_str}
        
        Generate a strong, formal closing statement summarizing your arguments and explaining why your side wins this debate.
        Respond in JSON format:
        {{
          "closing_statement": "string",
          "summary_points": ["string"]
        }}
        """
        try:
            response = self.llm.invoke(prompt, response_format={"type": "json_object"})
            return json.loads(response.content)
        except Exception as e:
            logger.error(f"Failed to generate closing: {e}")
            return {
                "closing_statement": "Thank you. In conclusion, the affirmative side holds the stronger position due to policy stability.",
                "summary_points": ["Policy stability"]
            }
