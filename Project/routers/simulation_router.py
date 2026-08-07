"""AI Debate Simulation Router"""
from __future__ import annotations
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
from engines import simulation_engine as sim

router = APIRouter(prefix="/simulation", tags=["AI Debate Simulation"])


class SimulationStartIn(BaseModel):
    topic: str
    human_position: str = "for"
    ai_position: str = "against"
    debate_format: str = "one_on_one"
    opening_argument: str = ""


class SimulationRespondIn(BaseModel):
    human_text: str


@router.post("/start")
def start_simulation(
    payload: SimulationStartIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Start a new AI debate simulation session.
    The AI takes the opposing position and responds dynamically.
    """
    session_id = f"sim-{current_user['id']}-{uuid.uuid4().hex[:8]}"
    return sim.create_session(
        session_id=session_id,
        topic=payload.topic,
        human_position=payload.human_position,
        ai_position=payload.ai_position,
        debate_format=payload.debate_format,
        opening_argument=payload.opening_argument,
    )


@router.post("/{session_id}/respond")
def respond_in_simulation(
    session_id: str,
    payload: SimulationRespondIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Submit your argument and get the AI's rebuttal."""
    try:
        return sim.add_human_turn(session_id, payload.human_text)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{session_id}/end")
def end_simulation(
    session_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """End the debate session and get final coaching feedback."""
    try:
        return sim.end_session(session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{session_id}")
def get_simulation(
    session_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Get the full turn-by-turn debate history."""
    session = sim.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Simulation session not found")
    return session
