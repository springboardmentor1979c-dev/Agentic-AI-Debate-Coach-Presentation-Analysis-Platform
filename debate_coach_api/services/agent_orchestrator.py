"""
Agentic Orchestrator — coordinates specialized AI agents in a pipeline.
Inspired by LangGraph / CrewAI multi-agent patterns.
Each agent is a focused function; the orchestrator chains them.
"""
import json
import time
from datetime import datetime
from sqlalchemy.orm import Session
from models.models import AgentRun, AgentType, Argument, DebateScore, PresentationAnalysis
from services.llm_engine import call_llm, parse_llm_json
from services.analysis import analyze_argument, detect_fallacies, generate_counterarguments
from services.scoring import compute_debate_score


# ── Individual Agents ─────────────────────────────────────────────────────────

def speech_agent(transcript: str, db: Session, session_id: int = None) -> dict:
    """Extracts claims, evidence, keywords from raw transcript text."""
    prompt = f"""Analyze this debate speech transcript and extract:
1. Main claim (1 sentence)
2. Supporting evidence points (list)
3. Key argument keywords (list)
4. Sentiment: positive/negative/neutral
5. Argument strength score 1-10

Transcript: {transcript[:1500]}

Respond in JSON with keys: claim, evidence_points, keywords, sentiment, strength_score"""

    system = "You are an expert argument mining system. Extract structured information from debate speeches."
    response, tokens, latency = call_llm(prompt, system)
    result = parse_llm_json(response)

    _log_agent_run(db, AgentType.speech, {"transcript_length": len(transcript)}, result, tokens, latency, session_id)
    return result


def argument_agent(argument_text: str, topic: str, db: Session, session_id: int = None) -> dict:
    """Deep analysis of a single argument against the debate topic."""
    prompt = f"""Evaluate this debate argument on the topic: "{topic}"

Argument: {argument_text}

Score each dimension from 0-10 and provide brief reasoning:
- clarity: How clear and understandable is the argument?
- relevance: How relevant is it to the topic?
- evidence_strength: How well-supported with evidence?
- logical_consistency: Is the reasoning logically sound?
- persuasiveness: How persuasive is the overall argument?

Also provide: overall_feedback (2-3 sentences)

Respond in JSON."""

    system = "You are an expert debate judge with 20 years of experience evaluating arguments."
    response, tokens, latency = call_llm(prompt, system)
    result = parse_llm_json(response)

    _log_agent_run(db, AgentType.argument, {"argument": argument_text[:200]}, result, tokens, latency, session_id)
    return result


def fallacy_agent(argument_text: str, db: Session, session_id: int = None) -> dict:
    """Detects logical fallacies in an argument using LLM reasoning."""
    prompt = f"""Analyze this argument for logical fallacies:

"{argument_text}"

Check for: Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority,
Circular Reasoning, Hasty Generalization, Red Herring, False Cause, Bandwagon.

For each fallacy found, provide:
- type: fallacy name
- explanation: why this is a fallacy in this context
- correction: how to fix the argument
- confidence: 0.0-1.0

If no fallacies found, return empty list.
Respond in JSON with key "fallacies" as a list."""

    system = "You are a logic professor specializing in identifying reasoning errors and fallacies."
    response, tokens, latency = call_llm(prompt, system)
    result = parse_llm_json(response)

    _log_agent_run(db, AgentType.fallacy, {"argument": argument_text[:200]}, result, tokens, latency, session_id)
    return result


def rebuttal_agent(argument_text: str, topic: str, position: str, db: Session, session_id: int = None) -> dict:
    """Generates strategic counterarguments from the opposing position."""
    opposing = "con" if position == "pro" else "pro"
    prompt = f"""Generate strong counterarguments for this debate:

Topic: "{topic}"
Original argument ({position} side): "{argument_text}"

Generate 3 counterarguments from the {opposing} side:
1. Logical rebuttal — attack the reasoning
2. Evidence-based rebuttal — challenge with data/facts
3. Ethical/practical rebuttal — highlight real-world concerns

For each, provide: type, content (2-3 sentences), strategy (1 sentence tactic)

Respond in JSON with key "counterarguments" as a list."""

    system = "You are a championship debate coach who excels at generating powerful rebuttals."
    response, tokens, latency = call_llm(prompt, system)
    result = parse_llm_json(response)

    _log_agent_run(db, AgentType.rebuttal, {"argument": argument_text[:200], "topic": topic}, result, tokens, latency, session_id)
    return result


def scoring_agent(session_summary: dict, db: Session, session_id: int = None) -> dict:
    """Produces final weighted debate score with LLM-generated feedback."""
    prompt = f"""Score this debate performance:

Topic: {session_summary.get('topic', 'Unknown')}
Arguments submitted: {session_summary.get('argument_count', 0)}
Average clarity: {session_summary.get('avg_clarity', 0)}/10
Average evidence strength: {session_summary.get('avg_evidence', 0)}/10
Fallacies detected: {session_summary.get('fallacy_count', 0)}

Provide scores (0-10) for:
- argument_quality (weight 30%)
- evidence_usage (weight 20%)
- logical_consistency (weight 20%)
- rebuttal_effectiveness (weight 15%)
- communication_skills (weight 15%)

Also provide: feedback (3-4 sentences), recommendations (list of 3 tips)

Respond in JSON."""

    system = "You are a professional debate evaluator providing fair, constructive performance assessments."
    response, tokens, latency = call_llm(prompt, system)
    result = parse_llm_json(response)

    _log_agent_run(db, AgentType.scoring, session_summary, result, tokens, latency, session_id)
    return result


def coach_agent(user_history: dict, db: Session) -> dict:
    """Generates personalized coaching plan based on user's performance history."""
    prompt = f"""Create a personalized coaching plan for this debater:

Experience level: {user_history.get('experience_level', 'beginner')}
Average debate score: {user_history.get('avg_debate_score', 0)}/10
Average presentation score: {user_history.get('avg_presentation_score', 0)}/10
Total sessions: {user_history.get('debate_count', 0)}
Weak areas: {user_history.get('weak_areas', 'unknown')}
Goals: {user_history.get('goals', 'improve overall')}

Provide:
- focus_areas: list of 2-3 priority skills
- weekly_goals: specific weekly targets
- recommended_exercises: list of 3-5 practice exercises
- learning_path: list of 4-6 progressive milestones
- motivational_message: 1-2 sentences

Respond in JSON."""

    system = "You are an elite debate coach who creates personalized, actionable improvement plans."
    response, tokens, latency = call_llm(prompt, system)
    result = parse_llm_json(response)

    _log_agent_run(db, AgentType.coach, user_history, result, tokens, latency)
    return result


# ── Full Pipeline Orchestrator ────────────────────────────────────────────────

def run_full_analysis_pipeline(
    argument_text: str,
    topic: str,
    position: str,
    db: Session,
    session_id: int = None,
) -> dict:
    """
    Orchestrates: Speech → Argument → Fallacy → Rebuttal agents in sequence.
    Returns consolidated analysis result.
    """
    pipeline_start = time.time()

    # Stage 1: Extract structure
    speech_result = speech_agent(argument_text, db, session_id)

    # Stage 2: Deep argument analysis
    arg_result = argument_agent(argument_text, topic, db, session_id)

    # Stage 3: Fallacy detection
    fallacy_result = fallacy_agent(argument_text, db, session_id)

    # Stage 4: Generate rebuttals
    rebuttal_result = rebuttal_agent(argument_text, topic, position, db, session_id)

    total_ms = int((time.time() - pipeline_start) * 1000)

    return {
        "speech_analysis": speech_result,
        "argument_analysis": arg_result,
        "fallacies": fallacy_result.get("fallacies", []),
        "counterarguments": rebuttal_result.get("counterarguments", []),
        "pipeline_latency_ms": total_ms,
        "agents_run": ["speech", "argument", "fallacy", "rebuttal"],
    }


# ── Helper ────────────────────────────────────────────────────────────────────

def _log_agent_run(
    db: Session,
    agent_type: AgentType,
    input_data: dict,
    output_data: dict,
    tokens: int,
    latency: int,
    session_id: int = None,
):
    run = AgentRun(
        session_id=session_id,
        agent_type=agent_type,
        input_data=json.dumps(input_data)[:2000],
        output_data=json.dumps(output_data)[:2000],
        tokens_used=tokens,
        latency_ms=latency,
        status="completed",
    )
    db.add(run)
    db.commit()
