import json
from typing import List, Dict, Any
from ai_providers import ai_provider

SUPPORTED_FALLACIES = [
    "Ad Hominem",
    "Straw Man",
    "False Dilemma",
    "Slippery Slope",
    "Appeal to Authority",
    "Circular Reasoning",
    "Hasty Generalization",
    "Red Herring"
]

def detect_fallacies(argument: str) -> List[Dict[str, Any]]:
    prompt = f"""
    Scan the following debate argument for these logical fallacies: {', '.join(SUPPORTED_FALLACIES)}.
    For every fallacy detected, return the type, the specific text segment (span) where it occurs, an explanation, confidence score (0.0 to 1.0), why it weakens reasoning, and a correction suggestion.
    Do not claim certainty if the detection is ambiguous.
    
    Argument: "{argument}"
    
    Return EXACTLY a JSON object with a list "fallacies":
    {{
      "fallacies": [
        {{
          "type": "Fallacy Name",
          "span": "exact substring or context",
          "explanation": "Why this is a fallacy",
          "confidence": 0.9,
          "why_it_weakens": "How it impacts argumentation credibility",
          "correction": "How to restate the point logically"
        }}
      ]
    }}
    If no fallacies are detected, return an empty list under "fallacies".
    """
    
    response = ai_provider.complete(prompt, system_prompt="You are a Logical Fallacy Detection Engine. You must return clean, valid JSON only.", json_mode=True)
    try:
        data = json.loads(response)
        fallacies = data.get("fallacies", [])
        if not isinstance(fallacies, list):
            fallacies = []
        return fallacies
    except Exception:
        return []
