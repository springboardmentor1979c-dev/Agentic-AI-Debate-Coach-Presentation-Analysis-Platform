import os
import logging
import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.models import User, PresentationAnalysis, SpeechMetric, VideoMetric, Report, DebateSession
from backend.app.core.dependencies import get_current_user
from fastapi.responses import FileResponse

# Import AI Workflow/Services
from backend.app.ai.workflow.workflows import build_presentation_analysis_graph
from backend.app.ai.report_generator.report_generator import ReportGenerator

logger = logging.getLogger("debate_coach_api_presentation")

router = APIRouter(tags=["Presentation Analysis"])

presentation_workflow = build_presentation_analysis_graph()
report_engine = ReportGenerator()

# Local storage path for uploaded files and reports
UPLOAD_DIR = "./static/uploads"
REPORTS_DIR = "./static/reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

@router.post("/presentation/upload")
async def upload_presentation_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Saves uploaded media files (audio/video) locally and generates a mock transcript."""
    filename = f"user_{current_user.id}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(filepath, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")

    # Generates mock/fallback transcript
    transcript = "Distinguished judges. I believe that Universal Basic Income is an essential policy. As automation rates increase, jobs are displaced. UBI provides an economic buffer to stabilize local communities, allowing workers to retrain for tech roles."

    return {
        "filename": file.filename,
        "filepath": filepath,
        "media_type": file.content_type,
        "transcript": transcript
    }


@router.post("/presentation/analyze")
def analyze_presentation(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filepath = body.get("filepath", "")
    transcript = body.get("transcript", "")
    slides_info = body.get("slides_info", "Slide 1: Intro. Slide 2: Automation data. Slide 3: Inflation response.")
    debate_session_id = body.get("debate_session_id")
    
    # Run Presentation Analysis Workflow
    state_input = {
        "video_path": filepath if "mp4" in filepath or "avi" in filepath else "",
        "audio_path": filepath,
        "transcript": transcript,
        "slides": slides_info
    }

    try:
        output_state = presentation_workflow.invoke(state_input)
        scores_data = output_state.get("scores", {})
        feedback_data = output_state.get("feedback", {})
        speech_results = output_state.get("speech_metrics", {})
        video_results = output_state.get("video_metrics", {})

        # Create database records
        analysis_record = PresentationAnalysis(
            user_id=current_user.id,
            debate_session_id=debate_session_id,
            confidence_score=scores_data.get("confidence_score", 70.0),
            clarity_score=scores_data.get("clarity_score", 70.0),
            engagement_score=scores_data.get("engagement_score", 70.0),
            pace_score=scores_data.get("pace_score", 70.0),
            overall_score=scores_data.get("overall_score", 70.0)
        )
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)

        # Save Speech Metrics
        sm_metrics = speech_results.get("metrics", {})
        speech_record = SpeechMetric(
            presentation_id=analysis_record.id,
            words_per_minute=sm_metrics.get("words_per_minute", 130.0),
            pause_count=sm_metrics.get("pause_count", 4),
            filler_words=json.dumps(speech_results.get("speech_tips", [])),
            pitch=sm_metrics.get("pitch", 140.0),
            volume=sm_metrics.get("volume", -20.0),
            confidence=sm_metrics.get("confidence", 80.0)
        )
        db.add(speech_record)

        # Save Video Metrics
        vm_metrics = video_results.get("metrics", {})
        video_record = VideoMetric(
            presentation_id=analysis_record.id,
            eye_contact=vm_metrics.get("eye_contact", 78.5),
            head_pose=vm_metrics.get("head_pose", 85.0),
            gestures=vm_metrics.get("gestures", "[]"),
            facial_expression=vm_metrics.get("facial_expression", "[]"),
            body_posture=vm_metrics.get("body_posture", "[]")
        )
        db.add(video_record)
        db.commit()

        # Generate default PDF/JSON/CSV report files
        report_data = {
            "scores": scores_data,
            "speech_metrics": sm_metrics,
            "video_metrics": vm_metrics,
            "feedback": feedback_data
        }
        
        pdf_name = f"report_{analysis_record.id}.pdf"
        json_name = f"report_{analysis_record.id}.json"
        
        pdf_path = report_engine.generate_pdf_report(report_data, REPORTS_DIR, pdf_name)
        json_path = report_engine.generate_json_report(report_data, REPORTS_DIR, json_name)

        # Save Report metadata
        report_record = Report(
            user_id=current_user.id,
            presentation_id=analysis_record.id,
            pdf_path=pdf_path,
            json_path=json_path
        )
        db.add(report_record)
        db.commit()

        return {
            "analysis_id": analysis_record.id,
            "scores": scores_data,
            "feedback": feedback_data,
            "speech": speech_results,
            "video": video_results,
            "pdf_report": pdf_path,
            "json_report": json_path
        }
    except Exception as e:
        logger.error(f"Error executing presentation analysis: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/speech/analyze")
def analyze_speech(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    filepath = body.get("filepath", "")
    transcript = body.get("transcript", "")
    
    from backend.app.ai.speech_analysis.vocal_analyzer import SpeechAnalyzer
    analyzer = SpeechAnalyzer()
    res = analyzer.analyze_audio(filepath, transcript)
    return res


@router.post("/video/analyze")
def analyze_video(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    filepath = body.get("filepath", "")
    
    from backend.app.ai.video_analysis.visual_analyzer import VisualAnalyzer
    analyzer = VisualAnalyzer()
    res = analyzer.analyze_video(filepath)
    return res


@router.get("/presentation/report/{id}")
def get_presentation_report_file(
    id: int,
    file_type: str = "pdf",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.presentation_id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found for this presentation analysis")
        
    # Check permissions
    analysis = db.query(PresentationAnalysis).filter(PresentationAnalysis.id == id).first()
    if analysis and analysis.user_id != current_user.id and current_user.role not in ["Admin", "Coach"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    path = report.pdf_path if file_type.lower() == "pdf" else report.json_path
    
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Report file does not exist on disk")

    return FileResponse(path, filename=os.path.basename(path))


@router.get("/analytics")
def get_overall_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregates scores and metrics across all user sessions for progress charting."""
    analyses = db.query(PresentationAnalysis).filter(PresentationAnalysis.user_id == current_user.id).all()
    
    if not analyses:
        return {
            "overall_average": 0.0,
            "progress_timeline": [],
            "averages": {
                "confidence": 0.0,
                "clarity": 0.0,
                "engagement": 0.0,
                "pace": 0.0
            }
        }

    timeline = []
    tot_conf = 0.0
    tot_clar = 0.0
    tot_eng = 0.0
    tot_pace = 0.0
    tot_overall = 0.0

    for a in analyses:
        tot_conf += a.confidence_score
        tot_clar += a.clarity_score
        tot_eng += a.engagement_score
        tot_pace += a.pace_score
        tot_overall += a.overall_score
        
        timeline.append({
            "date": a.created_at.strftime("%Y-%m-%d"),
            "overall": a.overall_score,
            "confidence": a.confidence_score,
            "clarity": a.clarity_score
        })

    n = len(analyses)
    return {
        "overall_average": round(tot_overall / n, 1),
        "averages": {
            "confidence": round(tot_conf / n, 1),
            "clarity": round(tot_clar / n, 1),
            "engagement": round(tot_eng / n, 1),
            "pace": round(tot_pace / n, 1)
        },
        "progress_timeline": timeline
    }


@router.post("/export/pdf")
def export_pdf_report(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    pdf_name = f"export_{current_user.id}_{int(os.getpid())}.pdf"
    path = report_engine.generate_pdf_report(body, REPORTS_DIR, pdf_name)
    return FileResponse(path, filename=pdf_name)


@router.post("/export/json")
def export_json_report(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    json_name = f"export_{current_user.id}_{int(os.getpid())}.json"
    path = report_engine.generate_json_report(body, REPORTS_DIR, json_name)
    return FileResponse(path, filename=json_name)


@router.post("/export/csv")
def export_csv_report(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    csv_name = f"export_{current_user.id}_{int(os.getpid())}.csv"
    path = report_engine.generate_csv_report(body, REPORTS_DIR, csv_name)
    return FileResponse(path, filename=csv_name)
