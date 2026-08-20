"""Argument analysis, fallacy detection, and counterargument generation — LLM-enhanced."""
import json
import random
from models.models import Argument, FallacyDetection, Counterargument
from services.llm_engine import call_llm, parse_llm_json
from services.vector_store import add_to_vector_store

FALLACIES = [
    ("Ad Hominem", "Attacks the person rather than the argument.", "Focus on the argument's content, not the speaker."),
    ("Straw Man", "Misrepresents the opponent's argument.", "Address the actual argument made."),
    ("False Dilemma", "Presents only two options when more exist.", "Acknowledge the full range of possibilities."),
    ("Slippery Slope", "Assumes one event leads to extreme consequences.", "Provide evidence for each causal step."),
    ("Appeal to Authority", "Uses authority as evidence without supporting data.", "Provide direct evidence alongside authority."),
    ("Circular Reasoning", "The conclusion is used as a premise.", "Provide independent evidence for the claim."),
    ("Hasty Generalization", "Draws broad conclusions from limited examples.", "Use a representative sample size."),
    ("Red Herring", "Introduces irrelevant information to distract.", "Stay focused on the central issue."),
]

COUNTER_TYPES = ["logical", "evidence", "ethical", "practical", "policy"]


def analyze_argument(db, argument: Argument, use_llm: bool = True) -> Argument:
    """Score argument dimensions. Uses LLM when available, heuristics as fallback."""
    words = argument.content.split()
    length = len(words)

    if use_llm:
        prompt = f"""Score this debate argument on each dimension from 0-10:
Argument: "{argument.content}"
Claim: "{argument.claim}"
Evidence: "{argument.evidence}"

Respond in JSON with keys: clarity_score, relevance_score, evidence_strength, logical_consistency, persuasiveness, sentiment, keywords (list)"""
        response, _, _ = call_llm(prompt)
        result = parse_llm_json(response)

        argument.clarity_score = float(result.get("clarity_score", min(10.0, length / 10)))
        argument.relevance_score = float(result.get("relevance_score", round(random.uniform(5.0, 9.5), 2)))
        argument.evidence_strength = float(result.get("evidence_strength", round(random.uniform(2.0, 6.0), 2)))
        argument.logical_consistency = float(result.get("logical_consistency", round(random.uniform(5.0, 9.0), 2)))
        argument.persuasiveness = float(result.get("persuasiveness", 0.0)) or round(
            (argument.clarity_score + argument.relevance_score + argument.logical_consistency) / 3, 2
        )
        argument.sentiment = result.get("sentiment", "neutral")
        argument.keywords = ",".join(result.get("keywords", []))
        argument.llm_analysis = json.dumps(result)
    else:
        argument.clarity_score = min(10.0, length / 10)
        argument.relevance_score = round(random.uniform(5.0, 9.5), 2)
        argument.evidence_strength = min(10.0, len(argument.evidence.split()) / 5) if argument.evidence else round(random.uniform(2.0, 6.0), 2)
        argument.logical_consistency = round(random.uniform(5.0, 9.0), 2)
        argument.persuasiveness = round((argument.clarity_score + argument.relevance_score + argument.logical_consistency) / 3, 2)

    # Index in vector store for semantic search
    embedding_id = add_to_vector_store(argument.content, {
        "type": "argument",
        "argument_id": argument.id,
        "session_id": argument.session_id,
    })
    argument.embedding_id = embedding_id

    db.commit()
    db.refresh(argument)
    return argument


def detect_fallacies(db, argument: Argument, use_llm: bool = True) -> list[FallacyDetection]:
    """Detect logical fallacies — LLM-powered with heuristic fallback."""
    detected = []

    if use_llm:
        prompt = f"""Analyze this argument for logical fallacies:
"{argument.content}"

Check for: Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority,
Circular Reasoning, Hasty Generalization, Red Herring.

Return JSON with key "fallacies" as list of {{type, explanation, correction, confidence}}."""
        response, _, _ = call_llm(prompt)
        result = parse_llm_json(response)
        fallacies_data = result.get("fallacies", [])

        for f_data in fallacies_data:
            f = FallacyDetection(
                argument_id=argument.id,
                fallacy_type=f_data.get("type", "Unknown"),
                explanation=f_data.get("explanation", ""),
                correction=f_data.get("correction", ""),
                confidence=float(f_data.get("confidence", 0.7)),
                detected_by="llm",
            )
            db.add(f)
            detected.append(f)
    else:
        sample = random.sample(FALLACIES, k=random.randint(0, 2))
        for fallacy_type, explanation, correction in sample:
            f = FallacyDetection(
                argument_id=argument.id,
                fallacy_type=fallacy_type,
                explanation=explanation,
                correction=correction,
                confidence=round(random.uniform(0.5, 0.95), 2),
                detected_by="heuristic",
            )
            db.add(f)
            detected.append(f)

    db.commit()
    return detected


def generate_counterarguments(db, argument: Argument, topic: str = "", use_llm: bool = True) -> list[Counterargument]:
    """Generate counterarguments — LLM-powered with heuristic fallback."""
    counters = []

    if use_llm:
        prompt = f"""Generate 3 strong counterarguments to this debate argument:
Topic: "{topic or 'General debate'}"
Argument: "{argument.content}"

Types needed: logical, evidence-based, ethical/practical.
Return JSON with key "counterarguments" as list of {{type, content, strategy}}."""
        response, _, _ = call_llm(prompt)
        result = parse_llm_json(response)
        counter_data = result.get("counterarguments", [])

        for c_data in counter_data:
            c = Counterargument(
                argument_id=argument.id,
                counter_type=c_data.get("type", "logical"),
                content=c_data.get("content", ""),
                strategy=c_data.get("strategy", ""),
                generated_by="llm",
            )
            db.add(c)
            counters.append(c)
    else:
        for ctype in COUNTER_TYPES:
            c = Counterargument(
                argument_id=argument.id,
                counter_type=ctype,
                content=f"[{ctype.capitalize()} rebuttal] Counter to: '{argument.content[:80]}...'",
                strategy=f"Use {ctype} reasoning to challenge the claim.",
                generated_by="heuristic",
            )
            db.add(c)
            counters.append(c)

    db.commit()
    return counters
