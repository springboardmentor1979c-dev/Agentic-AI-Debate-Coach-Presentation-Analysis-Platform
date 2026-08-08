"""AI Debate Simulation Engine.

Provides AI opponent persona generation, dynamic argument generation,
multi-turn debate simulation, real-time challenge generation, and inline debate coaching assistance.
"""

import re
import random
from typing import Any, Dict, List, Tuple


class AIDebateSimulationEngine:
    """Core simulation engine for interactive multi-turn AI debate rounds."""

    PERSONAS = {
        "socratic": {
            "key": "socratic",
            "name": "Dr. Sophia Vance",
            "title": "Socratic Scholar",
            "style": "Methodical, probing, questions fundamental assumptions, high clarity.",
            "tone": "Analytical & Intellectual",
            "avatar": "🎓",
        },
        "hard_hitting": {
            "key": "hard_hitting",
            "name": "Marcus Vance",
            "title": "Hard-hitting Debater",
            "style": "Aggressive, direct rebuttals, swift flaw detection, high pressure.",
            "tone": "Assertive & Firm",
            "avatar": "⚔️",
        },
        "policy": {
            "key": "policy",
            "name": "Elena Rostova",
            "title": "Policy & Systems Expert",
            "style": "Data-driven, pragmatic, implementation & economic feasibility focused.",
            "tone": "Pragmatic & Technical",
            "avatar": "📊",
        },
        "moralist": {
            "key": "moralist",
            "name": "Julian Thorne",
            "title": "Empathetic Moralist",
            "style": "Human-centric, ethical principles, rights and equity focused.",
            "tone": "Passionate & Principled",
            "avatar": "⚖️",
        },
        "pragmatist": {
            "key": "pragmatist",
            "name": "David Chen",
            "title": "Pragmatic Realist",
            "style": "Real-world impact, unintended consequences, compromise & execution.",
            "tone": "Direct & Practical",
            "avatar": "🌐",
        },
    }

    def generate_opponent(self, persona_key: str | None, topic: str, user_position: str) -> Dict[str, Any]:
        """Generate an AI opponent profile tailored to the topic and opposing position."""
        key = (persona_key or "socratic").lower()
        persona = self.PERSONAS.get(key, self.PERSONAS["socratic"])

        clean_user_pos = (user_position or "For").strip().capitalize()
        ai_position = "Against" if clean_user_pos in ["For", "Affirmative", "Pro"] else "For"

        opening = self._generate_opening_statement(topic, ai_position, persona)

        return {
            "persona_key": persona["key"],
            "name": persona["name"],
            "title": persona["title"],
            "style": persona["style"],
            "tone": persona["tone"],
            "avatar": persona["avatar"],
            "user_position": clean_user_pos,
            "ai_position": ai_position,
            "topic": topic,
            "opening_statement": opening,
        }

    def start_session(
        self, topic: str, persona_key: str | None = None, user_position: str = "For"
    ) -> Dict[str, Any]:
        """Start a new debate simulation session."""
        raw_key = (persona_key or "socratic").lower()
        if "socratic" in raw_key:
            key = "socratic"
        elif "hard" in raw_key:
            key = "hard_hitting"
        elif "policy" in raw_key:
            key = "policy"
        elif "moral" in raw_key:
            key = "moralist"
        elif "pragmat" in raw_key:
            key = "pragmatist"
        else:
            key = "socratic"

        opponent = self.generate_opponent(key, topic, user_position)
        if persona_key and "socratic_scholar" in persona_key.lower():
            opponent["name"] = "Socratic Scholar"

        return {
            "topic": topic,
            "persona_key": key,
            "user_position": user_position,
            "opponent": opponent,
            "turn_number": 0,
            "turns": [],
        }

    def process_turn(
        self,
        session_or_topic: Any,
        user_arg_or_opponent: Any = None,
        turn_number: int = 1,
        user_argument: str = "",
        history: List[Dict[str, Any]] | None = None,
    ) -> Dict[str, Any]:
        """Process a debate turn: generate AI response, real-time challenge, and coaching feedback."""
        if isinstance(session_or_topic, dict):
            session = session_or_topic
            topic = session.get("topic", "General Debate")
            opponent = session.get("opponent", {})
            user_arg = user_arg_or_opponent if isinstance(user_arg_or_opponent, str) else user_argument
            turn_num = session.get("turn_number", 0) + 1
            session["turn_number"] = turn_num
            hist = session.get("turns", [])
        else:
            topic = str(session_or_topic)
            opponent = user_arg_or_opponent if isinstance(user_arg_or_opponent, dict) else {}
            turn_num = turn_number
            user_arg = user_argument
            hist = history or []

        cleaned_arg = (user_arg or "").strip()

        # 1. Dynamic AI Response Generation
        ai_response = self._generate_ai_response(topic, opponent, turn_num, cleaned_arg, hist)

        # 2. Real-Time Challenge Generation
        challenge = self._generate_challenge(topic, opponent, cleaned_arg)

        # 3. Debate Coaching Assistance
        coaching = self._generate_coaching_feedback(cleaned_arg, ai_response, turn_num)

        result = {
            "turn_number": turn_num,
            "user_argument": cleaned_arg,
            "ai_response": ai_response,
            "challenge_question": challenge,
            "coaching_feedback": coaching,
        }

        if isinstance(session_or_topic, dict):
            session_or_topic.setdefault("turns", []).append(result)

        return result

    def generate_summary(
        self, topic: str, opponent: Dict[str, Any], turns: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate a complete debate transcript summary and final decision."""
        if not turns:
            return {
                "overall_winner": "Draw",
                "final_user_score": 0,
                "final_ai_score": 0,
                "summary": "No debate turns recorded.",
                "key_takeaways": [],
            }

        user_scores = [t.get("coaching_feedback", {}).get("turn_score", 70) for t in turns]
        avg_user_score = int(sum(user_scores) / len(user_scores)) if user_scores else 70
        avg_ai_score = max(65, min(95, avg_user_score + random.randint(-5, 8)))

        if avg_user_score > avg_ai_score:
            winner = "User (Debater)"
            verdict = "You presented stronger evidence, clearer structure, and effectively countered opponent challenges."
        elif avg_user_score < avg_ai_score:
            winner = f"AI Opponent ({opponent.get('name', 'Opponent')})"
            verdict = f"{opponent.get('name', 'Opponent')} maintained consistent strategic pressure and exposed key assumptions."
        else:
            winner = "Balanced Draw"
            verdict = "Both debaters delivered compelling arguments with equal persuasion and logical rigour."

        takeaways = [
            f"Completed {len(turns)} exchange round(s) on '{topic}'.",
            f"Average User Argument Quality: {avg_user_score}/100.",
            f"Opponent ({opponent.get('title')}) Score: {avg_ai_score}/100.",
            "Focus on backing assertion claims with concrete data in future rounds.",
        ]

        return {
            "topic": topic,
            "opponent_name": opponent.get("name"),
            "opponent_title": opponent.get("title"),
            "total_rounds": len(turns),
            "overall_winner": winner,
            "final_user_score": avg_user_score,
            "final_ai_score": avg_ai_score,
            "verdict": verdict,
            "key_takeaways": takeaways,
        }

    def _generate_opening_statement(self, topic: str, ai_position: str, persona: Dict[str, Any]) -> str:
        pos_label = "in favor of" if ai_position == "For" else "strongly against"
        return (
            f"Greetings. I am {persona['name']}, standing {pos_label} the motion: '{topic}'. "
            f"As a {persona['title'].lower()}, my position is grounded in rigorous analysis. "
            f"I invite you to present your opening arguments, and I look forward to a sharp, intellectually honest debate."
        )

    def _generate_ai_response(
        self,
        topic: str,
        opponent: Dict[str, Any],
        turn_number: int,
        user_argument: str,
        history: List[Dict[str, Any]],
    ) -> str:
        words = re.findall(r"\b\w+\b", user_argument.lower())
        key_words = [w for w in words if len(w) > 4 and w not in ["about", "would", "should", "there", "their", "which", "could"]][:3]
        topic_ref = f" regarding {topic}" if topic else ""

        # Extract main premise preview
        user_snippet = f"Your claim that '{' '.join(key_words)}' forms an interesting point" if key_words else "While your point is noted"

        rebuttal_templates = [
            f"{user_snippet}, but it overlooks critical counter-evidence{topic_ref}. First, your premise assumes ideal implementation without considering real-world friction. Second, prioritizing this stance creates unintended structural imbalances.",
            f"I must challenge your argument{topic_ref}. {user_snippet} fails to account for empirical realities. The data indicates that enforcement costs and secondary consequences far outweigh the proposed benefits.",
            f"With respect, that perspective is fundamentally incomplete{topic_ref}. {user_snippet} confuses short-term momentum with long-term sustainability. A rigorous policy must address core systemic trade-offs.",
        ]

        response = random.choice(rebuttal_templates)

        if opponent.get("key") == "socratic":
            response += " I ask you to examine: what foundational assumption allows you to dismiss these systemic risks?"
        elif opponent.get("key") == "hard_hitting":
            response += " Simply asserting this position without verifiable proof will not hold under intense scrutiny!"
        elif opponent.get("key") == "policy":
            response += " Where is the cost-benefit metric proving feasibility at scale?"
        elif opponent.get("key") == "moralist":
            response += " We must prioritize ethical integrity and fairness over superficial convenience."

        return response

    def _generate_challenge(self, topic: str, opponent: Dict[str, Any], user_argument: str) -> str:
        challenges = [
            f"Challenge Question: How do you address the risk of unintended consequences on '{topic}'?",
            f"Cross-Examination: What concrete evidence proves your position holds under economic stress?",
            f"Counter-Challenge: Can you demonstrate that your proposal respects foundational ethical constraints?",
            f"Dilemma Question: If your primary premise fails, what alternative framework preserves your stance?",
        ]
        return random.choice(challenges)

    def _generate_coaching_feedback(self, user_argument: str, ai_response: str, turn_number: int) -> Dict[str, Any]:
        words = len(re.findall(r"\b\w+\b", user_argument))
        sentences = max(1, len(re.split(r"[.!?]+", user_argument)))

        clarity_score = min(95, max(50, 60 + (words // 10)))
        evidence_score = 80 if any(k in user_argument.lower() for k in ["data", "study", "percent", "%", "evidence", "proven", "because"]) else 55
        rebuttal_score = min(90, max(55, 65 + (sentences * 4)))

        turn_score = int((clarity_score * 0.35) + (evidence_score * 0.35) + (rebuttal_score * 0.30))

        strengths = []
        if words > 25:
            strengths.append("Delivered a detailed and substantive response.")
        if evidence_score > 70:
            strengths.append("Incorporated evidence indicators and reasoning connectives.")
        if not strengths:
            strengths.append("Clear thesis statement presented.")

        vulnerabilities = []
        if evidence_score <= 60:
            vulnerabilities.append("Lacks specific empirical statistics or cited studies.")
        if words < 20:
            vulnerabilities.append("Turn is relatively brief; expand on core mechanisms.")
        if not vulnerabilities:
            vulnerabilities.append("Ensure your conclusion ties directly back to the motion.")

        strategic_advice = (
            "In your next turn, directly quote the AI's counter-point and refute its core assumption "
            "before introducing your next supporting pillar."
        )

        suggested_responses = [
            "Counter with data: Cite specific economic or historical precedents.",
            "Reframe the issue: Shift emphasis from short-term friction to long-term impact.",
            "Expose opponent dilemma: Challenge the AI's alternative to show it carries greater risk.",
        ]

        return {
            "turn_score": turn_score,
            "clarity_score": clarity_score,
            "evidence_score": evidence_score,
            "rebuttal_score": rebuttal_score,
            "strengths": strengths,
            "vulnerabilities": vulnerabilities,
            "strategic_advice": strategic_advice,
            "suggested_responses": suggested_responses,
        }
