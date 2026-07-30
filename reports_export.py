import os
from typing import Dict, Any, List

def generate_pdf_report(
    filepath: str,
    user_info: Dict[str, Any],
    session_data: Dict[str, Any],
    scores: Dict[str, Any],
    turns: List[Dict[str, Any]],
    recommendations: List[str]
):
    """
    Generates a debate performance report in PDF format using reportlab.
    Falls back to a standard text report if reportlab is not installed.
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Premium layout styling
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#151827'),
            spaceAfter=15
        )
        
        h2_style = ParagraphStyle(
            'ReportHeading2',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#5b4cf0'),
            spaceBefore=15,
            spaceAfter=10
        )
        
        normal_style = styles['Normal']

        story = []
        story.append(Paragraph(f"Debate Session Performance Report", title_style))
        story.append(Paragraph(f"User: {user_info.get('username')}", normal_style))
        story.append(Paragraph(f"Topic: {session_data.get('topic')}", normal_style))
        story.append(Paragraph(f"Format: {session_data.get('format')} | Position: {session_data.get('position')}", normal_style))
        story.append(Spacer(1, 15))

        story.append(Paragraph("Weighted Performance Scores", h2_style))
        
        score_data = [
            ["Metric Dimension", "Weight", "Score"],
            ["Argument Quality", "30%", f"{scores.get('argument_quality', 0.0)}%"],
            ["Evidence Usage", "20%", f"{scores.get('evidence_usage', 0.0)}%"],
            ["Logical Consistency", "20%", f"{scores.get('logical_consistency', 0.0)}%"],
            ["Rebuttal Effectiveness", "15%", f"{scores.get('rebuttal_effectiveness', 0.0)}%"],
            ["Communication Skills", "15%", f"{scores.get('communication_skills', 0.0)}%"],
            ["OVERALL SCORE", "100%", f"{scores.get('overall_score', 0.0)}%"]
        ]
        
        t = Table(score_data, colWidths=[200, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#5b4cf0')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#eeecff')),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ]))
        story.append(t)
        story.append(Spacer(1, 15))

        if "avg_wpm" in scores and scores["avg_wpm"]:
            story.append(Paragraph("Speech Delivery Metrics", h2_style))
            story.append(Paragraph(f"Total Speaking Duration: {scores.get('total_duration', 0.0)} seconds", normal_style))
            story.append(Paragraph(f"Total Spoken Words: {scores.get('total_words', 0)} words", normal_style))
            story.append(Paragraph(f"Average Speaking Pace: {scores.get('avg_wpm', 0.0)} Words Per Minute (WPM)", normal_style))
            story.append(Paragraph(f"Linguistic Filler Words: {scores.get('total_fillers', 0)} fillers detected", normal_style))
            story.append(Spacer(1, 15))

        story.append(Paragraph("Coaching Recommendations", h2_style))
        for rec in recommendations:
            story.append(Paragraph(f"• {rec}", normal_style))
            story.append(Spacer(1, 5))
            
        doc.build(story)
        
    except ImportError:
        # Simple plain text fallback
        with open(filepath, "w") as f:
            f.write("Debate Session Performance Report\n")
            f.write("=================================\n")
            f.write(f"User: {user_info.get('username')}\n")
            f.write(f"Topic: {session_data.get('topic')}\n")
            f.write(f"Format: {session_data.get('format')} | Position: {session_data.get('position')}\n\n")
            f.write("Performance Scores:\n")
            for k, v in scores.items():
                f.write(f"- {k.replace('_', ' ').title()}: {v}%\n")
            f.write("\nCoaching Recommendations:\n")
            for rec in recommendations:
                f.write(f"- {rec}\n")

def generate_excel_report(
    filepath: str,
    user_info: Dict[str, Any],
    session_data: Dict[str, Any],
    scores: Dict[str, Any],
    turns: List[Dict[str, Any]]
):
    """
    Generates a spreadsheet performance export using openpyxl.
    Falls back to a standard comma separated list (CSV) if openpyxl is not installed.
    """
    try:
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Performance Report"
        
        ws.append(["Debate Session Performance Report"])
        ws.append([])
        ws.append(["User", user_info.get("username")])
        ws.append(["Topic", session_data.get("topic")])
        ws.append(["Format", session_data.get("format")])
        ws.append(["Position", session_data.get("position")])
        ws.append([])
        ws.append(["Metric Dimension", "Score"])
        
        for k, v in scores.items():
            ws.append([k.replace("_", " ").title(), v])
            
        wb.save(filepath)
    except ImportError:
        # Simple CSV format fallback
        import csv
        with open(filepath, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Debate Session Performance Report"])
            writer.writerow([])
            writer.writerow(["User", user_info.get("username")])
            writer.writerow(["Topic", session_data.get("topic")])
            writer.writerow(["Format", session_data.get("format")])
            writer.writerow(["Position", session_data.get("position")])
            writer.writerow([])
            writer.writerow(["Metric Dimension", "Score"])
            for k, v in scores.items():
                writer.writerow([k.replace("_", " ").title(), v])
