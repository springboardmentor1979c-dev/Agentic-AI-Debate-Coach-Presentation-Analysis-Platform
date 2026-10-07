import os
import csv
import json
import logging
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

logger = logging.getLogger("debate_coach_reports")

class ReportGenerator:
    def generate_json_report(self, data: dict, output_dir: str, filename: str) -> str:
        """Generates structured JSON report."""
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        return filepath

    def generate_csv_report(self, data: dict, output_dir: str, filename: str) -> str:
        """Generates structured CSV report focusing on metrics."""
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, filename)
        
        # Flatten simple keys
        flat_data = []
        
        # Add basic info
        flat_data.append(["Report Type", "Debate & Presentation Summary"])
        flat_data.append(["Generated At", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")])
        flat_data.append([])
        
        # Add scores
        if "scores" in data:
            flat_data.append(["--- SCORES ---"])
            for k, v in data["scores"].items():
                flat_data.append([k, v])
            flat_data.append([])
            
        # Add speech metrics
        if "speech_metrics" in data:
            flat_data.append(["--- SPEECH METRICS ---"])
            for k, v in data["speech_metrics"].items():
                flat_data.append([k, v])
            flat_data.append([])
            
        # Add video metrics
        if "video_metrics" in data:
            flat_data.append(["--- VIDEO METRICS ---"])
            for k, v in data["video_metrics"].items():
                flat_data.append([k, v])
            flat_data.append([])

        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerows(flat_data)
        return filepath

    def generate_pdf_report(self, data: dict, output_dir: str, filename: str) -> str:
        """Generates professional PDF report using ReportLab."""
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Custom styles for dark-theme accent or standard clean professional look
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=20
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#0F172A'),
            spaceBefore=15,
            spaceAfter=10
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#334155'),
            spaceAfter=8
        )

        story = []
        
        # Title
        story.append(Paragraph("Debate Coach & Presentation Analysis Report", title_style))
        story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%B %d, %Y')}", body_style))
        story.append(Spacer(1, 15))
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", subtitle_style))
        exec_summary = data.get("executive_summary", "This report contains the evaluation details of your recent debate session and presentation delivery. Use the feedback below to improve logic and vocal skills.")
        story.append(Paragraph(exec_summary, body_style))
        story.append(Spacer(1, 10))

        # Overall Scores Table
        story.append(Paragraph("Scores Overview", subtitle_style))
        scores = data.get("scores", {})
        score_data = [["Metric", "Value"]]
        for k, v in scores.items():
            score_data.append([k.replace("_", " ").title(), str(v)])
            
        t = Table(score_data, colWidths=[200, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (1,0), colors.HexColor('#F1F5F9')),
            ('TEXTCOLOR', (0,0), (1,0), colors.HexColor('#0F172A')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(t)
        story.append(Spacer(1, 15))

        # Fallacies Detected
        fallacies = data.get("fallacies", [])
        if fallacies:
            story.append(Paragraph("Detected Logical Fallacies", subtitle_style))
            for f in fallacies:
                story.append(Paragraph(f"• <b>{f.get('fallacy_type', 'Fallacy')}</b> ({f.get('severity', 'Medium')} Severity)", body_style))
                story.append(Paragraph(f"  <i>Description:</i> {f.get('description', '')}", body_style))
                if f.get('correction'):
                    story.append(Paragraph(f"  <i>Correction:</i> {f.get('correction', '')}", body_style))
                story.append(Spacer(1, 5))
            story.append(Spacer(1, 10))

        # Recommendations
        rec = data.get("feedback", {}).get("recommendations", []) or data.get("recommendations", [])
        if rec:
            story.append(Paragraph("Key Improvement Recommendations", subtitle_style))
            for r in rec:
                story.append(Paragraph(f"- {r}", body_style))
            story.append(Spacer(1, 10))
            
        # Learning Plan
        lp = data.get("learning_plan", {}).get("weekly_plan", [])
        if lp:
            story.append(Paragraph("Personalized 7-Day Action Plan", subtitle_style))
            for week in lp:
                for day in week.get("days", []):
                    story.append(Paragraph(f"<b>Day {day.get('day')}: {day.get('exercise')}</b> - {day.get('description')}", body_style))
            story.append(Spacer(1, 10))

        doc.build(story)
        return filepath
