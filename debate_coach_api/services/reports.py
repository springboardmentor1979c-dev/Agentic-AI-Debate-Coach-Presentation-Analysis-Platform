"""Report generation: PDF and Excel export."""
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import openpyxl


def generate_pdf_report(data: dict) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, data.get("title", "Report"))
    c.setFont("Helvetica", 12)
    y = 720
    for key, value in data.get("content", {}).items():
        c.drawString(50, y, f"{key}: {value}")
        y -= 20
        if y < 50:
            c.showPage()
            y = 750
    c.save()
    buffer.seek(0)
    return buffer.read()


def generate_excel_report(rows: list[dict], sheet_name: str = "Report") -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet_name
    if not rows:
        buffer = io.BytesIO()
        wb.save(buffer)
        return buffer.getvalue()
    headers = list(rows[0].keys())
    ws.append(headers)
    for row in rows:
        ws.append([row.get(h, "") for h in headers])
    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()
