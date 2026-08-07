"""
Counterargument Generation Engine
Generates rebuttals and counterarguments in 5 types:
  - Logical Rebuttal
  - Evidence-Based Rebuttal
  - Ethical Counterargument
  - Practical Counterargument
  - Policy Counterargument
"""
from __future__ import annotations

import os
import json
from dataclasses import dataclass, field, asdict
from typing import List

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


@dataclass
class Counterargument:
    counter_type: str
    rebuttal: str
    supporting_points: List[str]
    challenge_question: str
    debate_strategy: str


@dataclass
class CounterargumentReport:
    original_argument: str
    topic: str
    counterarguments: List[Counterargument] = field(default_factory=list)
    best_counter_type: str = ""
    overall_strategy: str = ""


_LLM_COUNTER_PROMPT = """You are an expert debate strategist. Generate 5 different types of counterarguments 
against the given argument on the specified debate topic.

Return ONLY valid JSON (no markdown, no extra text):
{{
  "counterarguments": [
    {{
      "counter_type": "Logical Rebuttal",
      "rebuttal": "<logical counter>",
      "supporting_points": ["<point1>", "<point2>"],
      "challenge_question": "<question to pose to the opponent>",
      "debate_strategy": "<strategic advice>"
    }},
    {{
      "counter_type": "Evidence-Based Rebuttal",
      "rebuttal": "<evidence-based counter>",
      "supporting_points": ["<point1>", "<point2>"],
      "challenge_question": "<question>",
      "debate_strategy": "<strategy>"
    }},
    {{
      "counter_type": "Ethical Counterargument",
      "rebuttal": "<ethical counter>",
      "supporting_points": ["<point1>", "<point2>"],
      "challenge_question": "<question>",
      "debate_strategy": "<strategy>"
    }},
    {{
      "counter_type": "Practical Counterargument",
      "rebuttal": "<practical counter>",
      "supporting_points": ["<point1>", "<point2>"],
      "challenge_question": "<question>",
      "debate_strategy": "<strategy>"
    }},
    {{
      "counter_type": "Policy Counterargument",
      "rebuttal": "<policy counter>",
      "supporting_points": ["<point1>", "<point2>"],
      "challenge_question": "<question>",
      "debate_strategy": "<strategy>"
    }}
  ],
  "best_counter_type": "<which type is strongest>",
  "overall_strategy": "<overall debate strategy recommendation>"
}}

Topic: {topic}
Original Argument: {argument}
"""


_RULE_TEMPLATES = {
    "Logical Rebuttal": (
        "The logical basis of this argument is flawed because it assumes without proof that "
        "the premise directly leads to the stated conclusion. Counter: Even if we accept the "
        "premise, the conclusion does not necessarily follow.",
        [
            "The causal link between premise and conclusion is not established.",
            "Alternative explanations exist that the argument ignores.",
        ],
        "Can you demonstrate that there is no other explanation for this outcome?",
        "Use formal logical structure to expose the gap between premise and conclusion.",
    ),
    "Evidence-Based Rebuttal": (
        "The argument lacks empirical support. Available research and data suggest the opposite "
        "may be true. Without verifiable evidence, the claim remains speculative.",
        [
            "No peer-reviewed studies are cited to support the claim.",
            "Anecdotal evidence is used in place of statistical data.",
        ],
        "What specific data or research supports your position?",
        "Cite opposing studies and ask the opponent to provide quantifiable evidence.",
    ),
    "Ethical Counterargument": (
        "This argument raises serious ethical concerns. The proposed position could harm "
        "vulnerable groups or violate fundamental principles of fairness and justice.",
        [
            "The argument prioritizes efficiency over human dignity.",
            "Minority and underrepresented voices are ignored in this reasoning.",
        ],
        "Have you considered the ethical implications for those most affected by this policy?",
        "Shift the debate to values and human impact to reveal the moral cost of the opponent's position.",
    ),
    "Practical Counterargument": (
        "While the argument sounds appealing in theory, it is impractical to implement. "
        "Real-world constraints such as resources, infrastructure, and human behavior "
        "make this approach unfeasible.",
        [
            "Implementation would require resources that are not currently available.",
            "Similar initiatives have failed due to logistical and operational challenges.",
        ],
        "What is the specific implementation plan and how will the identified challenges be overcome?",
        "Ground the debate in practical realities and challenge the opponent to address execution details.",
    ),
    "Policy Counterargument": (
        "From a policy perspective, this argument overlooks existing regulatory frameworks "
        "and the unintended consequences of proposed changes. Better policies already exist.",
        [
            "Existing legislation already addresses this issue more effectively.",
            "The proposed policy could create perverse incentives.",
        ],
        "How does your proposal account for existing legal frameworks and regulatory compliance?",
        "Use policy analysis and historical precedent to demonstrate the inadequacy of the opponent's position.",
    ),
}


def _rule_based_counter(argument: str, topic: str) -> CounterargumentReport:
    counters = []
    for ctype, (rebuttal, points, question, strategy) in _RULE_TEMPLATES.items():
        counters.append(Counterargument(
            counter_type=ctype,
            rebuttal=rebuttal,
            supporting_points=points,
            challenge_question=question,
            debate_strategy=strategy,
        ))
    return CounterargumentReport(
        original_argument=argument,
        topic=topic,
        counterarguments=counters,
        best_counter_type="Evidence-Based Rebuttal",
        overall_strategy=(
            "Lead with evidence-based rebuttals to undermine credibility, then appeal to "
            "ethical and practical concerns to shift the moral and strategic high ground."
        ),
    )


def _llm_counter(argument: str, topic: str) -> CounterargumentReport:
    try:
        import openai
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": _LLM_COUNTER_PROMPT.format(topic=topic, argument=argument)}],
            temperature=0.6,
            max_tokens=1200,
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        counters = [Counterargument(**c) for c in data.get("counterarguments", [])]
        return CounterargumentReport(
            original_argument=argument,
            topic=topic,
            counterarguments=counters,
            best_counter_type=data.get("best_counter_type", ""),
            overall_strategy=data.get("overall_strategy", ""),
        )
    except Exception:
        return _rule_based_counter(argument, topic)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def generate_counterarguments(argument: str, topic: str) -> dict:
    """Generate counterarguments for a given argument and topic."""
    if OPENAI_API_KEY:
        report = _llm_counter(argument, topic)
    else:
        report = _rule_based_counter(argument, topic)
    return asdict(report)
