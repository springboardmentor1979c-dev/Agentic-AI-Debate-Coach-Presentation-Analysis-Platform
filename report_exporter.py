"""Reports & Export System (Module 13).

Generates Debate Reports, Presentation Analysis Reports, Performance Score Reports,
Coaching Reports, and Learning Progress Reports in JSON, PDF (Document), and Excel (CSV/XLSX-compatible) formats.
"""

import csv
import io
from typing import Any, Dict, List
import sqlite3


class ReportExportSystem:
    """Core reporting and document export system."""

    def get_debate_report(self, analysis_id: int, connection: sqlite3.Connection) -> Dict[str, Any]:
        """Fetch debate report data."""
        row = connection.execute(
            "SELECT * FROM argument_analyses WHERE id = ?", (analysis_id,)
        ).fetchone()
        if not row:
            return {"error": "Debate analysis report not found"}
        data = dict(row)
        return {
            "report_type": "Debate Report",
            "title": data.get("title", "Debate Analysis Report"),
            "topic": data.get("topic", "N/A"),
            "clarity_score": data.get("clarity_score", 0),
            "relevance_score": data.get("relevance_score", 0),
            "evidence_score": data.get("evidence_score", 0),
            "logic_score": data.get("logic_score", 0),
            "persuasiveness_score": data.get("persuasiveness_score", 0),
            "overall_score": data.get("overall_score", 0),
            "speech_text": data.get("speech_text", ""),
            "created_at": data.get("created_at", ""),
        }

    def get_presentation_report(self, analysis_id: int, connection: sqlite3.Connection) -> Dict[str, Any]:
        """Fetch presentation analysis report data."""
        row = connection.execute(
            "SELECT * FROM presentation_analyses WHERE id = ?", (analysis_id,)
        ).fetchone()
        if not row:
            return {"error": "Presentation analysis report not found"}
        data = dict(row)
        return {
            "report_type": "Presentation Analysis Report",
            "title": data.get("title", "Presentation Analysis Report"),
            "speech_pace_wpm": data.get("speech_pace_wpm", 0),
            "filler_count": data.get("filler_count", 0),
            "filler_density": data.get("filler_density", 0.0),
            "confidence_score": data.get("confidence_score", 0.0),
            "clarity_score": data.get("clarity_score", 0.0),
            "audience_engagement": data.get("audience_engagement", 0.0),
            "overall_score": data.get("overall_score", 0.0),
            "created_at": data.get("created_at", ""),
        }

    def get_performance_report(self, card_id: int, connection: sqlite3.Connection) -> Dict[str, Any]:
        """Fetch performance score report data."""
        row = connection.execute(
            "SELECT * FROM performance_scorecards WHERE id = ?", (card_id,)
        ).fetchone()
        if not row:
            return {"error": "Performance score report not found"}
        data = dict(row)
        return {
            "report_type": "Performance Score Report",
            "title": data.get("title", "Performance Scorecard"),
            "debate_score": data.get("debate_score", 0.0),
            "presentation_score": data.get("presentation_score", 0.0),
            "critical_thinking_score": data.get("critical_thinking_score", 0.0),
            "communication_score": data.get("communication_score", 0.0),
            "overall_performance_score": data.get("overall_performance_score", 0.0),
            "performance_tier": data.get("performance_tier", "N/A"),
            "created_at": data.get("created_at", ""),
        }

    def get_coaching_report(self, plan_id: int, connection: sqlite3.Connection) -> Dict[str, Any]:
        """Fetch coaching plan report data."""
        row = connection.execute(
            "SELECT * FROM coaching_plans WHERE id = ?", (plan_id,)
        ).fetchone()
        if not row:
            return {"error": "Coaching report not found"}
        data = dict(row)
        return {
            "report_type": "Coaching Report",
            "title": data.get("title", "Personalized Coaching Plan"),
            "experience_level": data.get("experience_level", "Beginner"),
            "target_focus": data.get("target_focus", "Rebuttal Strategy"),
            "created_at": data.get("created_at", ""),
        }

    def get_learning_progress_report(self, user_id: int, connection: sqlite3.Connection) -> Dict[str, Any]:
        """Fetch learning progress report data aggregating user sessions."""
        debates = connection.execute("SELECT COUNT(*) as cnt FROM debate_history WHERE user_id = ?", (user_id,)).fetchone()["cnt"]
        scorecards = connection.execute("SELECT COUNT(*) as cnt FROM performance_scorecards WHERE user_id = ?", (user_id,)).fetchone()["cnt"]
        last_card = connection.execute("SELECT overall_performance_score, performance_tier FROM performance_scorecards WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,)).fetchone()
        
        return {
            "report_type": "Learning Progress Report",
            "user_id": user_id,
            "completed_debate_rounds": debates,
            "completed_scorecards": scorecards,
            "current_performance_rating": last_card["overall_performance_score"] if last_card else 75.0,
            "performance_tier": last_card["performance_tier"] if last_card else "Proficient Speaker",
            "status": "Active Progress",
        }

    def export_excel(self, data: Dict[str, Any]) -> str:
        """Export report data to Excel-compatible CSV string buffer."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Metric / Field", "Value"])
        for key, val in data.items():
            writer.writerow([key.replace("_", " ").title(), str(val)])
        return output.getvalue()

    def export_pdf(self, data: Dict[str, Any]) -> bytes:
        """Export report data to formatted PDF bytes buffer."""
        pdf_header = (
            "%PDF-1.4\n"
            "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
            "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
            "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
            "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        )
        
        lines = [f"{data.get('report_type', 'REPORT')}: {data.get('title', 'Executive Summary')}"]
        for k, v in data.items():
            if k not in ["report_type", "title"]:
                lines.append(f"{k.replace('_', ' ').title()}: {v}")
        
        content_stream_text = "BT /F1 14 Tf 50 720 Td 18 TL\n"
        for line in lines[:15]:
            clean_line = line.replace("(", "[").replace(")", "]")
            content_stream_text += f"({clean_line}) ' \n"
        content_stream_text += "ET\n"
        
        content_length = len(content_stream_text)
        obj4 = f"4 0 obj << /Length {content_length} >> stream\n{content_stream_text}endstream\nendobj\n"
        
        pdf_footer = "xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000280 00000 n\n0000000220 00000 n\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n380\n%%EOF"
        
        pdf_str = pdf_header + obj4 + pdf_footer
        return pdf_str.encode("latin-1", errors="ignore")
