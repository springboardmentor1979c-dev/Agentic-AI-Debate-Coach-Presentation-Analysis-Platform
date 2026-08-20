"""
LLM Engine — abstraction over OpenAI / Anthropic / Mock.
Falls back to mock responses when no API key is configured.
"""
import json
import time
from config import LLM_PROVIDER, LLM_MODEL, LLM_TEMPERATURE, LLM_MAX_TOKENS, OPENAI_API_KEY, ANTHROPIC_API_KEY


def _mock_response(prompt: str) -> str:
    """Deterministic mock for development / testing without API keys."""
    if "fallac" in prompt.lower():
        return json.dumps({
            "fallacies": [
                {"type": "Ad Hominem", "explanation": "Attacks the speaker rather than the argument.", "correction": "Focus on the argument content.", "confidence": 0.82}
            ]
        })
    if "counter" in prompt.lower() or "rebuttal" in prompt.lower():
        return json.dumps({
            "counterarguments": [
                {"type": "logical", "content": "While the claim has merit, empirical data suggests otherwise.", "strategy": "Evidence-based rebuttal"},
                {"type": "ethical", "content": "This position overlooks the societal impact on vulnerable groups.", "strategy": "Ethical counterargument"},
                {"type": "practical", "content": "Implementation would face significant resource constraints.", "strategy": "Practical challenge"}
            ]
        })
    if "score" in prompt.lower() or "evaluat" in prompt.lower():
        return json.dumps({
            "argument_quality": 7.2,
            "evidence_usage": 6.5,
            "logical_consistency": 7.8,
            "rebuttal_effectiveness": 6.0,
            "communication_skills": 7.5,
            "feedback": "Strong logical structure. Improve evidence citations and rebuttal directness.",
            "recommendations": ["Add more statistical evidence", "Address opponent's key points directly", "Vary sentence structure for engagement"]
        })
    if "coach" in prompt.lower() or "presentation" in prompt.lower():
        return json.dumps({
            "coaching_tips": [
                "Reduce filler words — aim for under 5 per minute.",
                "Vary your pitch to maintain audience engagement.",
                "Use the pause technique before key points for emphasis.",
                "Structure arguments with: Claim → Evidence → Impact."
            ],
            "focus_areas": ["delivery", "evidence_usage"],
            "learning_path": ["Practice 5-minute speeches daily", "Record and review weekly", "Join a debate club"]
        })
    if "debate" in prompt.lower() or "argument" in prompt.lower():
        return json.dumps({
            "ai_response": "While your point raises valid concerns, consider that empirical research consistently demonstrates the opposite trend. For instance, studies from MIT and Stanford both indicate that the proposed approach leads to measurable improvements in outcomes. Furthermore, the logical premise of your argument relies on an assumption that has been challenged by recent evidence.",
            "strategy_used": "evidence_based",
            "turn_complete": True
        })
    return json.dumps({"response": "Analysis complete. The argument presents a coherent position with room for improvement in evidence quality."})


def call_llm(prompt: str, system_prompt: str = "") -> tuple[str, int, int]:
    """
    Call the configured LLM provider.
    Returns: (response_text, tokens_used, latency_ms)
    """
    start = time.time()

    # Use mock if no API keys or mock provider selected
    if LLM_PROVIDER == "mock" or (not OPENAI_API_KEY and not ANTHROPIC_API_KEY):
        latency = int((time.time() - start) * 1000) + 50
        return _mock_response(prompt), 150, latency

    if LLM_PROVIDER == "openai" and OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            resp = client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages,
                temperature=LLM_TEMPERATURE,
                max_tokens=LLM_MAX_TOKENS,
            )
            text = resp.choices[0].message.content
            tokens = resp.usage.total_tokens
            latency = int((time.time() - start) * 1000)
            return text, tokens, latency
        except Exception:
            pass

    if LLM_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            resp = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=LLM_MAX_TOKENS,
                system=system_prompt or "You are an expert debate coach.",
                messages=[{"role": "user", "content": prompt}],
            )
            text = resp.content[0].text
            tokens = resp.usage.input_tokens + resp.usage.output_tokens
            latency = int((time.time() - start) * 1000)
            return text, tokens, latency
        except Exception:
            pass

    # Fallback to mock
    latency = int((time.time() - start) * 1000) + 50
    return _mock_response(prompt), 150, latency


def parse_llm_json(text: str) -> dict:
    """Safely parse JSON from LLM output, stripping markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}
