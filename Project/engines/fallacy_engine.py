"""
Logical Fallacy Detection Engine
Detects 8 common logical fallacies using pattern matching + optional LLM analysis.
Supported fallacies:
  - Ad Hominem
  - Straw Man
  - False Dilemma
  - Slippery Slope
  - Appeal to Authority
  - Circular Reasoning
  - Hasty Generalization
  - Red Herring
"""
from __future__ import annotations

import re
import os
import json
from dataclasses import dataclass, field, asdict
from typing import List

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# --------------------------------------------------------------------------- #
# Fallacy definitions & patterns
# --------------------------------------------------------------------------- #
@dataclass
class FallacyMatch:
    fallacy_type: str
    explanation: str
    correction_suggestion: str
    severity: str  # "low" | "medium" | "high"
    matched_text: str

@dataclass
class FallacyReport:
    detected_fallacies: List[FallacyMatch] = field(default_factory=list)
    fallacy_count: int = 0
    credibility_score: float = 10.0  # starts perfect, deducted per fallacy
    overall_assessment: str = ""

# Pattern-based rules: (fallacy_name, [(pattern, flags)...], explanation, correction, severity)
_FALLACY_RULES = [
    (
        "Ad Hominem",
        [
            (r"\b(you|he|she|they)\s+are\s+(stupid|idiot|dumb|incompetent|ignorant)", re.I),
            (r"\bwhat would (you|he|she|they) know\b", re.I),
            (r"\bdon'?t listen to (him|her|them)\b", re.I),
        ],
        "This attacks the person rather than addressing their argument.",
        "Focus on the argument's content rather than the person making it.",
        "high",
    ),
    (
        "Straw Man",
        [
            (r"\bso you('re| are) saying\b", re.I),
            (r"\byou believe that\b", re.I),
            (r"\bthat('s| is) the same as saying\b", re.I),
        ],
        "This misrepresents the opponent's position to make it easier to attack.",
        "Accurately represent the opponent's argument before rebutting it.",
        "high",
    ),
    (
        "False Dilemma",
        [
            (r"\beither\s+.+\s+or\s+.+\b", re.I),
            (r"\byou'?re (either|with us|against us)\b", re.I),
            (r"\bthere (are only|is only) (two|2) options?\b", re.I),
            (r"\bit'?s (black|white) or (white|black)\b", re.I),
        ],
        "This presents only two options when more alternatives exist.",
        "Acknowledge the full spectrum of possible positions or solutions.",
        "medium",
    ),
    (
        "Slippery Slope",
        [
            (r"\bif we allow\b.{0,80}(eventually|soon|next)\b", re.I),
            (r"\bwill (inevitably|certainly|definitely) lead to\b", re.I),
            (r"\bone thing leads to another\b", re.I),
            (r"\bdomino effect\b", re.I),
        ],
        "This assumes a chain of events will inevitably occur without evidence.",
        "Provide evidence for each step of the causal chain, not just the endpoint.",
        "medium",
    ),
    (
        "Appeal to Authority",
        [
            (r"\b(experts|scientists|everyone) (agree|says|know)\b", re.I),
            (r"\bscience (says|proves|confirms)\b", re.I),
            (r"\bmy (doctor|teacher|professor|boss) (said|told me)\b", re.I),
        ],
        "This relies on authority alone without providing the actual evidence.",
        "Cite the specific evidence or study, not just the authority figure.",
        "low",
    ),
    (
        "Circular Reasoning",
        [
            (r"\bbecause it'?s (true|right|correct|obvious)\b", re.I),
            (r"\bthe (bible|book|law) says.{0,60}(therefore|so) it'?s (true|right)\b", re.I),
            (r"\bit is what it is\b", re.I),
        ],
        "The conclusion is used as a premise, creating a circular argument.",
        "Provide an independent reason that supports the conclusion.",
        "medium",
    ),
    (
        "Hasty Generalization",
        [
            (r"\ball\s+(men|women|people|muslims|christians|immigrants)\s+(are|do|think)\b", re.I),
            (r"\beveryone (knows|thinks|agrees)\b", re.I),
            (r"\bnobody (ever|really)\b", re.I),
            (r"\balways\s+happens\b", re.I),
        ],
        "This draws a broad conclusion from an insufficient number of examples.",
        "Use specific, representative evidence before making general claims.",
        "medium",
    ),
    (
        "Red Herring",
        [
            (r"\bbut what about\b", re.I),
            (r"\blet'?s (talk|focus) about .{0,40}instead\b", re.I),
            (r"\bthat reminds me of\b", re.I),
            (r"\bchanging the subject\b", re.I),
        ],
        "This introduces an irrelevant point to distract from the real issue.",
        "Stay on topic; address the actual argument being made.",
        "medium",
    ),
]

_SEVERITY_DEDUCTIONS = {"high": 2.5, "medium": 1.5, "low": 0.8}


def _pattern_detect(argument: str) -> FallacyReport:
    report = FallacyReport()
    text_lower = argument.lower()

    for fallacy_name, patterns, explanation, correction, severity in _FALLACY_RULES:
        for pattern_str, flags in patterns:
            match = re.search(pattern_str, argument, flags)
            if match:
                report.detected_fallacies.append(FallacyMatch(
                    fallacy_type=fallacy_name,
                    explanation=explanation,
                    correction_suggestion=correction,
                    severity=severity,
                    matched_text=match.group(0),
                ))
                break  # one match per fallacy type is enough

    report.fallacy_count = len(report.detected_fallacies)
    deduction = sum(_SEVERITY_DEDUCTIONS.get(f.severity, 1.0) for f in report.detected_fallacies)
    report.credibility_score = max(0.0, round(10.0 - deduction, 2))

    if report.fallacy_count == 0:
        report.overall_assessment = "No common fallacies detected. The argument appears logically sound."
    elif report.fallacy_count == 1:
        report.overall_assessment = f"1 fallacy detected ({report.detected_fallacies[0].fallacy_type}). Address it to strengthen your argument."
    else:
        names = ", ".join(f.fallacy_type for f in report.detected_fallacies)
        report.overall_assessment = f"{report.fallacy_count} fallacies detected: {names}. Significant logical weaknesses found."

    return report


_LLM_FALLACY_PROMPT = """You are an expert in logic and argumentation. Detect logical fallacies in the argument below.
Return ONLY valid JSON (no markdown) with this schema:
{{
  "detected_fallacies": [
    {{
      "fallacy_type": "<one of: Ad Hominem | Straw Man | False Dilemma | Slippery Slope | Appeal to Authority | Circular Reasoning | Hasty Generalization | Red Herring>",
      "explanation": "<why this is a fallacy>",
      "correction_suggestion": "<how to fix it>",
      "severity": "<low|medium|high>",
      "matched_text": "<the problematic phrase>"
    }}
  ],
  "fallacy_count": <int>,
  "credibility_score": <float 0-10>,
  "overall_assessment": "<summary>"
}}

Argument: {argument}
"""


def _llm_detect(argument: str) -> FallacyReport:
    try:
        import openai
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": _LLM_FALLACY_PROMPT.format(argument=argument)}],
            temperature=0.2,
            max_tokens=800,
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        fallacies = [FallacyMatch(**f) for f in data.get("detected_fallacies", [])]
        return FallacyReport(
            detected_fallacies=fallacies,
            fallacy_count=data.get("fallacy_count", len(fallacies)),
            credibility_score=data.get("credibility_score", 10.0),
            overall_assessment=data.get("overall_assessment", ""),
        )
    except Exception:
        return _pattern_detect(argument)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def detect_fallacies(argument: str) -> dict:
    """Detect logical fallacies in the given argument text."""
    if OPENAI_API_KEY:
        report = _llm_detect(argument)
    else:
        report = _pattern_detect(argument)
    # Convert to serialisable dict
    result = asdict(report)
    return result
