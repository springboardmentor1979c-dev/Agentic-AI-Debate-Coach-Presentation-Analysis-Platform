"""Analysis Engine Router — Argument, Fallacy, Counterargument, Presentation"""
from __future__ import annotations
from typing import Annotated, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth import get_current_user
from engines.argument_engine import analyze_argument
from engines.fallacy_engine import detect_fallacies
from engines.counterargument_engine import generate_counterarguments
from engines.presentation_engine import analyze_presentation

router = APIRouter(prefix="/analysis", tags=["Analysis Engines"])


class ArgumentAnalysisIn(BaseModel):
    argument: str
    topic: str = "General Debate"


class FallacyDetectionIn(BaseModel):
    argument: str


class CounterargumentIn(BaseModel):
    argument: str
    topic: str = "General Debate"


class PresentationIn(BaseModel):
    transcript: str
    duration_minutes: Optional[float] = None


@router.post("/argument")
def analyze_argument_endpoint(
    payload: ArgumentAnalysisIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Analyze an argument for clarity, relevance, evidence strength,
    logical consistency, and persuasiveness.
    """
    return analyze_argument(payload.argument, payload.topic)


@router.post("/fallacy")
def detect_fallacy_endpoint(
    payload: FallacyDetectionIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Detect logical fallacies in the provided argument text.
    Supports: Ad Hominem, Straw Man, False Dilemma, Slippery Slope,
    Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring.
    """
    return detect_fallacies(payload.argument)


@router.post("/counterargument")
def generate_counter_endpoint(
    payload: CounterargumentIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Generate 5 types of counterarguments:
    Logical, Evidence-Based, Ethical, Practical, Policy.
    """
    return generate_counterarguments(payload.argument, payload.topic)


@router.post("/presentation")
def analyze_presentation_endpoint(
    payload: PresentationIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Analyze a presentation transcript for pace, filler words,
    confidence, clarity, and engagement.
    """
    return analyze_presentation(payload.transcript, payload.duration_minutes)
