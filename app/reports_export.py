import io
try:
    from reportlab.pdfgen import canvas
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

def export_to_pdf(session_id: str):
    if not HAS_REPORTLAB:
        # Fallback if reportlab is not installed
        return b"%PDF-1.4\n1 0 obj\n<< /Title (Debate Coach Report - Install ReportLab) >>\nendobj\n"
    
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 800, f"Agentic AI Debate Coach - Report")
    c.setFont("Helvetica", 12)
    c.drawString(50, 770, f"Session ID: {session_id}")
    
    c.drawString(50, 730, "Performance Breakdown:")
    c.drawString(70, 710, "- Claim Score: 80/100")
    c.drawString(70, 690, "- Evidence Score: 75/100")
    c.drawString(70, 670, "- Rebuttal Score: 85/100")
    c.drawString(70, 650, "- Verdict Score: 90/100")
    
    c.drawString(50, 610, "Coach Feedback:")
    c.drawString(70, 590, "Your argument structure is extremely solid. You clearly stated")
    c.drawString(70, 570, "your claim and defended it well against logical fallacies.")
    
    c.save()
    buf.seek(0)
    return buf.read()

def export_to_excel(session_id: str):
    return b"Spreadsheet binary placeholder."
