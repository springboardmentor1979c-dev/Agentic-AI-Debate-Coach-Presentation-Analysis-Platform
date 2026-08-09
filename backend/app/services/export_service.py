import io
import csv
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_report(report_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#1e1b4b"),
        spaceAfter=12
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=16
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#4338ca"),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155")
    )

    story = []
    
    # Title
    user_name = report_data.get("user_name", "Learner")
    topic = report_data.get("topic", "AI Ethics & Global Policy")
    date_str = report_data.get("date", "2026-08-09")
    
    story.append(Paragraph("AI DEBATE & PRESENTATION COACH REPORT", title_style))
    story.append(Paragraph(f"<b>Candidate:</b> {user_name} | <b>Topic:</b> {topic} | <b>Date:</b> {date_str}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#6366f1"), spaceAfter=15))

    # Overall Score Table
    story.append(Paragraph("Performance Scorecard (30/20/20/15/15 Formula)", heading_style))
    
    table_data = [
        ["Scoring Dimension", "Weight", "Score", "Weighted Contrib."],
        ["Argument Quality", "30%", f"{report_data.get('arg_quality', 84.0)}%", f"{round(report_data.get('arg_quality', 84.0)*0.3, 1)}%"],
        ["Evidence Usage", "20%", f"{report_data.get('evidence', 80.0)}%", f"{round(report_data.get('evidence', 80.0)*0.2, 1)}%"],
        ["Logical Consistency", "20%", f"{report_data.get('logic', 85.0)}%", f"{round(report_data.get('logic', 85.0)*0.2, 1)}%"],
        ["Rebuttal Effectiveness", "15%", f"{report_data.get('rebuttal', 78.0)}%", f"{round(report_data.get('rebuttal', 78.0)*0.15, 1)}%"],
        ["Communication Skills", "15%", f"{report_data.get('communication', 83.0)}%", f"{round(report_data.get('communication', 83.0)*0.15, 1)}%"],
        ["OVERALL SCORE", "100%", f"{report_data.get('overall_score', 82.4)}%", f"{report_data.get('overall_score', 82.4)}%"]
    ]

    t = Table(table_data, colWidths=[180, 70, 90, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e0e7ff")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#3730a3")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#eef2ff")),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Speech Analytics Summary
    story.append(Paragraph("Speech & Presentation Metrics", heading_style))
    story.append(Paragraph(f"• <b>Pace (WPM):</b> {report_data.get('wpm', 145)} words/min (Optimal)", body_style))
    story.append(Paragraph(f"• <b>Filler Words Detected:</b> {report_data.get('filler_count', 4)} instances", body_style))
    story.append(Paragraph(f"• <b>Confidence Score:</b> {report_data.get('confidence', 86.5)}%", body_style))
    story.append(Paragraph(f"• <b>Audience Engagement Score:</b> {report_data.get('engagement', 82.0)}%", body_style))
    
    story.append(Spacer(1, 15))
    story.append(Paragraph("Actionable Coaching Recommendations", heading_style))
    recs = report_data.get("recommendations", [
        "Incorporate 2-3 specific empirical data citations per claim.",
        "Practice signposting using 4-step structured rebuttals.",
        "Replace filler words ('um', 'like') with 1-second power pauses."
    ])
    for r in recs:
        story.append(Paragraph(f"• {r}", body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def generate_excel_export(data_rows: List[Dict[str, Any]]) -> bytes:
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Student / Learner", "Role", "Debate Format", "Topic", "Overall Score", "Arg Quality", "Evidence", "Logic", "Rebuttal", "Communication"])
    
    for row in data_rows:
        writer.writerow([
            row.get("full_name", "Student"),
            row.get("role", "Learner"),
            row.get("format", "One-on-One"),
            row.get("topic", "AI Regulation"),
            row.get("overall_score", 82.0),
            row.get("arg_quality", 84.0),
            row.get("evidence", 80.0),
            row.get("logic", 85.0),
            row.get("rebuttal", 78.0),
            row.get("communication", 83.0),
        ])
        
    return output.getvalue().encode('utf-8')
