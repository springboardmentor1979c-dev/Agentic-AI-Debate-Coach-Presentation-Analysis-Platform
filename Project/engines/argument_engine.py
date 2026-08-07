"""
Argument Analysis Engine
Evaluates an argument on 5 criteria: Clarity, Relevance, Evidence Strength,
Logical Consistency, Persuasiveness.
Uses OpenAI GPT if OPENAI_API_KEY is set, otherwise falls back to a
rule-based heuristic scorer.
"""
from __future__ import annotations

import os
import re
import json
from dataclasses import dataclass, asdict

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# --------------------------------------------------------------------------- #
# Data structures
# --------------------------------------------------------------------------- #
@dataclass
class ArgumentScore:
    clarity: float           # 0-10
    relevance: float         # 0-10
    evidence_strength: float # 0-10
    logical_consistency: float # 0-10
    persuasiveness: float    # 0-10
    overall: float           # weighted average
    feedback: str
    suggestions: list[str]

# --------------------------------------------------------------------------- #
# Rule-based fallback scorer
# --------------------------------------------------------------------------- #
_EVIDENCE_PHRASES = [
    r"\baccording to\b", r"\bstudies show\b", r"\bresearch indicates\b",
    r"\bstatistic", r"\bpercent", r"\bdata\b", r"\bsource\b",
    r"\bexpert\b", r"\bprof\.?\b", r"\bdr\.?\b",
]
_FILLER_WORDS = ["uh", "um", "like", "you know", "basically", "literally"]
_LOGICAL_CONNECTORS = [
    "therefore", "because", "since", "thus", "hence", "as a result",
    "consequently", "however", "although", "in contrast", "on the other hand",
]


def _rule_based_score(argument: str, topic: str) -> ArgumentScore:
    text = argument.lower()
    word_count = len(argument.split())

    # Clarity — penalise very short / very long + filler words
    filler_count = sum(text.count(fw) for fw in _FILLER_WORDS)
    clarity = min(10.0, max(1.0, 7 - filler_count * 0.5 + min(word_count / 30, 3)))

    # Relevance — crude keyword overlap with topic
    topic_words = set(re.findall(r"\w+", topic.lower())) - {"the", "a", "an", "is", "of"}
    overlap = len(topic_words & set(re.findall(r"\w+", text)))
    relevance = min(10.0, max(1.0, 4 + overlap * 0.8))

    # Evidence strength
    ev_hits = sum(1 for p in _EVIDENCE_PHRASES if re.search(p, text))
    evidence_strength = min(10.0, max(1.0, 3 + ev_hits * 1.5))

    # Logical consistency — count logical connectors
    lc_hits = sum(1 for lc in _LOGICAL_CONNECTORS if lc in text)
    logical_consistency = min(10.0, max(1.0, 4 + lc_hits * 1.2))

    # Persuasiveness — blend of all + sentence variety
    sentence_count = max(1, len(re.split(r"[.!?]", argument)))
    persuasiveness = min(10.0, max(1.0,
        (clarity + relevance + evidence_strength + logical_consistency) / 5 + sentence_count * 0.2
    ))

    overall = round(
        clarity * 0.20 + relevance * 0.20 + evidence_strength * 0.20 +
        logical_consistency * 0.20 + persuasiveness * 0.20, 2
    )

    suggestions = []
    if clarity < 6:
        suggestions.append("Use clearer, more concise sentences and avoid filler words.")
    if evidence_strength < 5:
        suggestions.append("Back your claims with statistics, expert opinions, or cited studies.")
    if logical_consistency < 5:
        suggestions.append("Add explicit logical connectors (therefore, because, hence) to strengthen reasoning.")
    if relevance < 5:
        suggestions.append("Ensure your argument directly addresses the debate topic.")
    if persuasiveness < 5:
        suggestions.append("Vary sentence structure and include a compelling call-to-action or conclusion.")

    feedback = (
        f"Overall score: {overall}/10. "
        f"Your argument {'is solid' if overall >= 7 else 'needs improvement'}. "
        + (" ".join(suggestions) if suggestions else "Keep up the great work!")
    )

    return ArgumentScore(
        clarity=round(clarity, 2),
        relevance=round(relevance, 2),
        evidence_strength=round(evidence_strength, 2),
        logical_consistency=round(logical_consistency, 2),
        persuasiveness=round(persuasiveness, 2),
        overall=overall,
        feedback=feedback,
        suggestions=suggestions,
    )

# --------------------------------------------------------------------------- #
# LLM scorer (optional — used when OPENAI_API_KEY present)
# --------------------------------------------------------------------------- #
_LLM_PROMPT = """You are an expert debate judge. Evaluate the following argument for the topic provided.
Return ONLY valid JSON (no markdown, no explanation) with these fields:
{{
  "clarity": <float 0-10>,
  "relevance": <float 0-10>,
  "evidence_strength": <float 0-10>,
  "logical_consistency": <float 0-10>,
  "persuasiveness": <float 0-10>,
  "overall": <weighted average float>,
  "feedback": "<one paragraph evaluation>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}}

Topic: {topic}
Argument: {argument}
"""


def _llm_score(argument: str, topic: str) -> ArgumentScore:
    try:
        import openai  # lazy import so the app doesn't crash without the package
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": _LLM_PROMPT.format(topic=topic, argument=argument)}],
            temperature=0.3,
            max_tokens=600,
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        return ArgumentScore(**data)
    except Exception:
        return _rule_based_score(argument, topic)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def analyze_argument(argument: str, topic: str) -> dict:
    """
    Analyze an argument and return a scored dict.
    Uses LLM if OPENAI_API_KEY is set, otherwise falls back to rules.
    """
    if OPENAI_API_KEY:
        result = _llm_score(argument, topic)
    else:
        result = _rule_based_score(argument, topic)
    return asdict(result)
