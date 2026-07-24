"""Semantic search — vector-based search over arguments and debates."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, Argument, DebateSession
from utils.auth import get_current_user
from services.vector_store import semantic_search

router = APIRouter(prefix="/search", tags=["Semantic Search"])


@router.get("/arguments")
def search_arguments(
    q: str = Query(..., min_length=3, description="Search query"),
    top_k: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Semantic search over all indexed arguments."""
    vector_results = semantic_search(q, top_k=top_k)

    enriched = []
    for r in vector_results:
        arg_id = r.get("argument_id")
        if arg_id:
            arg = db.query(Argument).filter(Argument.id == int(arg_id)).first()
            if arg:
                enriched.append({
                    "argument_id": arg.id,
                    "content": arg.content[:200],
                    "session_id": arg.session_id,
                    "clarity_score": arg.clarity_score,
                    "semantic_distance": r.get("distance", 0),
                })

    return {
        "query": q,
        "results": enriched,
        "total": len(enriched),
        "note": "Results ranked by semantic similarity to your query.",
    }


@router.get("/debates")
def search_debates(
    q: str = Query(..., min_length=3),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full-text search over debate topics."""
    sessions = db.query(DebateSession).filter(
        DebateSession.topic.ilike(f"%{q}%")
    ).limit(10).all()

    return {
        "query": q,
        "results": [
            {"id": s.id, "topic": s.topic, "format": s.format, "status": s.status, "created_at": s.created_at}
            for s in sessions
        ],
        "total": len(sessions),
    }
