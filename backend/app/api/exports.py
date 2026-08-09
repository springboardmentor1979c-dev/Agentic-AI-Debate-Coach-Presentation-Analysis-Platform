from fastapi import APIRouter, Response
from app.services.export_service import generate_pdf_report, generate_excel_export

router = APIRouter(prefix="/exports", tags=["Reports & Exports"])

@router.get("/pdf/session/{session_id}")
async def export_session_pdf(session_id: int):
    sample_data = {
        "user_name": "Alex Chen",
        "topic": "AI Ethics & Global Governance",
        "date": "2026-08-09",
        "arg_quality": 84.0,
        "evidence": 80.0,
        "logic": 85.0,
        "rebuttal": 78.0,
        "communication": 83.0,
        "overall_score": 82.4,
        "wpm": 145,
        "filler_count": 4,
        "confidence": 86.5,
        "engagement": 82.0,
        "recommendations": [
            "Incorporate 2-3 empirical data citations per claim.",
            "Use the 4-step structured refutation framework.",
            "Replace verbal filler sounds with 1-second strategic pauses."
        ]
    }
    pdf_bytes = generate_pdf_report(sample_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=debate_report_session_{session_id}.pdf"}
    )

@router.get("/excel/class-analytics")
async def export_class_excel():
    data_rows = [
        {"full_name": "Alex Chen", "role": "Learner", "format": "Oxford", "topic": "AI Ethics", "overall_score": 85.5, "arg_quality": 86, "evidence": 84, "logic": 88, "rebuttal": 82, "communication": 87},
        {"full_name": "Sophia Rodriguez", "role": "Learner", "format": "Parliamentary", "topic": "Carbon Tax", "overall_score": 92.1, "arg_quality": 94, "evidence": 90, "logic": 93, "rebuttal": 91, "communication": 92},
        {"full_name": "Marcus Vance", "role": "Learner", "format": "Policy", "topic": "Healthcare Policy", "overall_score": 71.0, "arg_quality": 72, "evidence": 68, "logic": 74, "rebuttal": 69, "communication": 72},
        {"full_name": "Emily Watson", "role": "Learner", "format": "Public Forum", "topic": "Universal Income", "overall_score": 81.8, "arg_quality": 82, "evidence": 80, "logic": 83, "rebuttal": 80, "communication": 84}
    ]
    csv_bytes = generate_excel_export(data_rows)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=class_debate_analytics.csv"}
    )
