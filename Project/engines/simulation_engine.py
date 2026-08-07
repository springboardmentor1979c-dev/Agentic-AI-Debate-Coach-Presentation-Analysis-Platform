"""
AI Debate Simulation Engine
Manages multi-turn AI debate sessions. The AI takes the opposing position
and generates dynamic responses each turn.
"""
from __future__ import annotations

import os
import json
from dataclasses import dataclass, field, asdict
from typing import List, Literal

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

DebateFormat = Literal[
    "one_on_one", "parliamentary", "oxford", "policy", "public_forum"
]


@dataclass
class DebateTurn:
    turn_number: int
    speaker: Literal["human", "ai"]
    content: str
    argument_quality: str  # "strong" | "moderate" | "weak"
    coaching_note: str = ""


@dataclass
class SimulationSession:
    session_id: str
    topic: str
    human_position: str
    ai_position: str
    debate_format: str
    turns: List[DebateTurn] = field(default_factory=list)
    status: Literal["active", "completed"] = "active"
    final_coaching: str = ""

# In-memory session store (replace with DB in production)
_sessions: dict[str, SimulationSession] = {}


def _build_system_prompt(topic: str, ai_position: str, debate_format: str) -> str:
    format_instructions = {
        "parliamentary": "Follow parliamentary debate rules. Use formal language and structure arguments with propositions.",
        "oxford": "Follow Oxford debate style. Address the motion clearly and rebut opposing arguments.",
        "policy": "Focus on policy implications, feasibility, and evidence-based arguments.",
        "public_forum": "Keep arguments accessible to a general audience. Use clear logic and real-world examples.",
        "one_on_one": "Engage in direct one-on-one debate. Challenge each argument systematically.",
    }
    return f"""You are an expert AI debate opponent in a {debate_format} debate.
Topic: {topic}
Your position: {ai_position}
Debate format: {format_instructions.get(debate_format, format_instructions['one_on_one'])}

Instructions:
- Take the {ai_position} position firmly.
- Respond to the human's last argument with a direct, logical rebuttal.
- Build on previous arguments to create a coherent debate narrative.
- Keep responses to 3-5 sentences for a realistic debate pace.
- End with a challenge question or strong concluding statement.
"""


def _mock_ai_response(turn_number: int, human_text: str, ai_position: str, topic: str) -> str:
    """Fallback response when OpenAI is unavailable."""
    responses = [
        f"I strongly disagree. While you raise interesting points about {topic[:40]}, "
        f"the evidence actually supports {ai_position}. Studies have consistently shown "
        f"that the opposing view leads to better outcomes. Can you provide concrete data to support your claim?",

        f"That argument has significant weaknesses. You've made an assertion without sufficient evidence. "
        f"From the {ai_position} perspective, we see that practical implementation consistently "
        f"demonstrates the validity of our position. What specific proof do you have?",

        f"I must challenge that reasoning. The logical conclusion of your argument would lead to "
        f"unintended consequences that actually strengthen our {ai_position} stance. "
        f"How do you address the broader societal implications of your position?",

        f"Your argument overlooks several key factors. Historical precedent and current data "
        f"both support {ai_position}. Furthermore, experts in the field consistently "
        f"align with this view. Can you explain why you dismiss this substantial body of evidence?",
    ]
    return responses[(turn_number - 1) % len(responses)]


def _coaching_note(human_text: str) -> str:
    word_count = len(human_text.split())
    if word_count < 30:
        return "💡 Tip: Your argument is quite brief. Expand with evidence and reasoning."
    elif word_count > 200:
        return "💡 Tip: Keep your argument focused — aim for 50-100 words for maximum impact."
    if "because" not in human_text.lower() and "since" not in human_text.lower():
        return "💡 Tip: Use causal connectors (because, since, therefore) to strengthen logical flow."
    return "✅ Good structure! Keep building on evidence and addressing counterpoints."


def _assess_quality(human_text: str) -> str:
    word_count = len(human_text.split())
    has_evidence = any(w in human_text.lower() for w in ["study", "research", "data", "percent", "according"])
    has_logic = any(w in human_text.lower() for w in ["therefore", "because", "thus", "since", "hence"])
    score = (word_count > 50) + has_evidence + has_logic
    if score >= 2:
        return "strong"
    elif score == 1:
        return "moderate"
    return "weak"


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def create_session(
    session_id: str,
    topic: str,
    human_position: str,
    ai_position: str,
    debate_format: str = "one_on_one",
    opening_argument: str = "",
) -> dict:
    """Create a new simulation session."""
    session = SimulationSession(
        session_id=session_id,
        topic=topic,
        human_position=human_position,
        ai_position=ai_position,
        debate_format=debate_format,
    )

    if opening_argument:
        turn = DebateTurn(
            turn_number=1,
            speaker="human",
            content=opening_argument,
            argument_quality=_assess_quality(opening_argument),
            coaching_note=_coaching_note(opening_argument),
        )
        session.turns.append(turn)

        # AI responds to opening
        ai_reply = _get_ai_reply(session, opening_argument)
        ai_turn = DebateTurn(
            turn_number=2,
            speaker="ai",
            content=ai_reply,
            argument_quality="strong",
        )
        session.turns.append(ai_turn)

    _sessions[session_id] = session
    return asdict(session)


def _get_ai_reply(session: SimulationSession, human_text: str) -> str:
    turn_number = len(session.turns) + 1
    if OPENAI_API_KEY:
        try:
            import openai
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
            messages = [
                {"role": "system", "content": _build_system_prompt(
                    session.topic, session.ai_position, session.debate_format
                )}
            ]
            for turn in session.turns:
                role = "user" if turn.speaker == "human" else "assistant"
                messages.append({"role": role, "content": turn.content})
            messages.append({"role": "user", "content": human_text})

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=300,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            pass
    return _mock_ai_response(turn_number, human_text, session.ai_position, session.topic)


def add_human_turn(session_id: str, human_text: str) -> dict:
    """Add a human turn and get AI response."""
    session = _sessions.get(session_id)
    if session is None:
        raise ValueError(f"Session {session_id} not found")
    if session.status == "completed":
        raise ValueError("This debate session has already ended.")

    turn_num = len(session.turns) + 1
    human_turn = DebateTurn(
        turn_number=turn_num,
        speaker="human",
        content=human_text,
        argument_quality=_assess_quality(human_text),
        coaching_note=_coaching_note(human_text),
    )
    session.turns.append(human_turn)

    # AI response
    ai_reply = _get_ai_reply(session, human_text)
    ai_turn = DebateTurn(
        turn_number=turn_num + 1,
        speaker="ai",
        content=ai_reply,
        argument_quality="strong",
    )
    session.turns.append(ai_turn)
    _sessions[session_id] = session
    return asdict(session)


def end_session(session_id: str) -> dict:
    """Mark session as completed and generate final coaching."""
    session = _sessions.get(session_id)
    if session is None:
        raise ValueError(f"Session {session_id} not found")

    human_turns = [t for t in session.turns if t.speaker == "human"]
    strong = sum(1 for t in human_turns if t.argument_quality == "strong")
    moderate = sum(1 for t in human_turns if t.argument_quality == "moderate")
    weak = sum(1 for t in human_turns if t.argument_quality == "weak")

    session.status = "completed"
    session.final_coaching = (
        f"Debate complete! You made {len(human_turns)} arguments: "
        f"{strong} strong, {moderate} moderate, {weak} weak. "
        + ("Excellent debate performance!" if strong > weak else
           "Work on backing claims with evidence and using logical connectors.")
    )
    _sessions[session_id] = session
    return asdict(session)


def get_session(session_id: str) -> dict | None:
    session = _sessions.get(session_id)
    return asdict(session) if session else None
