from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, DebateScore, PresentationAnalysis, RoleEnum
from utils.auth import get_current_user, require_roles
from services.reports import generate_pdf_report, generate_excel_report

router = APIRouter(prefix="/reports", tags=["Reports & Export"])


@router.get("/debate/{session_id}/pdf")
def debate_pdf(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scores = db.query(DebateScore).filter(DebateScore.session_id == session_id).all()
    content = {f"User {s.user_id} Score": s.overall_score for s in scores}
    pdf = generate_pdf_report({"title": f"Debate Session {session_id} Report", "content": content})
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename=debate_{session_id}.pdf"})


@router.get("/debate/{session_id}/excel")
def debate_excel(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scores = db.query(DebateScore).filter(DebateScore.session_id == session_id).all()
    rows = [{"user_id": s.user_id, "overall_score": s.overall_score, "feedback": s.feedback} for s in scores]
    xlsx = generate_excel_report(rows, sheet_name="Debate Scores")
    return Response(content=xlsx, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": f"attachment; filename=debate_{session_id}.xlsx"})


@router.get("/presentation/{presentation_id}/pdf")
def presentation_pdf(presentation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(PresentationAnalysis).filter(PresentationAnalysis.id == presentation_id).first()
    content = {"Title": p.title, "Overall Score": p.overall_score, "Feedback": p.feedback} if p else {}
    pdf = generate_pdf_report({"title": "Presentation Analysis Report", "content": content})
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename=presentation_{presentation_id}.pdf"})
