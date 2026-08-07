"""Debate Session Management Router"""
from __future__ import annotations
import json
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

import database as db
from auth import get_current_user, require_role
from engines.argument_engine import analyze_argument

router = APIRouter(prefix="/debates", tags=["Debate Sessions"])


class DebateSessionIn(BaseModel):
    topic: str
    format: str = "one_on_one"
    position: str = "for"
    notes: str = ""


class DebateSessionStatusIn(BaseModel):
    status: str  # "active" | "completed" | "cancelled"


class ArgumentIn(BaseModel):
    content: str
    argument_type: str = "opening"  # opening | rebuttal | closing


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_session(
    payload: DebateSessionIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Create a new debate session for the current user."""
    session = db.create_debate_session(
        user_id=current_user["id"],
        topic=payload.topic,
        format=payload.format,
        position=payload.position,
        notes=payload.notes,
    )
    # Create a notification
    db.create_notification(
        user_id=current_user["id"],
        title="Debate Session Created",
        message=f"Your debate session on '{payload.topic}' has been created.",
        notif_type="success",
    )
    return session


@router.get("/")
def list_my_sessions(current_user: Annotated[dict, Depends(get_current_user)]):
    """List all debate sessions for the current user."""
    return db.get_user_debate_sessions(current_user["id"])


@router.get("/{session_id}")
def get_session(session_id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """Get a specific debate session with its arguments."""
    session = db.get_debate_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # Only owner, coach, educator, admin can view
    if session["user_id"] != current_user["id"] and current_user["role"] not in ("coach", "educator", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    arguments = db.get_session_arguments(session_id)
    return {"session": session, "arguments": arguments}


@router.put("/{session_id}/status")
def update_status(
    session_id: int,
    payload: DebateSessionStatusIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Update debate session status."""
    session = db.get_debate_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["user_id"] != current_user["id"] and current_user["role"] not in ("admin",):
        raise HTTPException(status_code=403, detail="Access denied")
    return db.update_session_status(session_id, payload.status)


@router.post("/{session_id}/arguments", status_code=status.HTTP_201_CREATED)
def submit_argument(
    session_id: int,
    payload: ArgumentIn,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Submit an argument to a debate session (with automatic analysis)."""
    session = db.get_debate_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Auto-analyze
    analysis = analyze_argument(payload.content, session["topic"])
    argument = db.add_argument(
        session_id=session_id,
        user_id=current_user["id"],
        content=payload.content,
        argument_type=payload.argument_type,
        analysis_json=json.dumps(analysis),
    )
    return {"argument": argument, "analysis": analysis}


@router.get("/{session_id}/arguments")
def get_arguments(session_id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """Get all arguments for a debate session."""
    session = db.get_debate_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db.get_session_arguments(session_id)
