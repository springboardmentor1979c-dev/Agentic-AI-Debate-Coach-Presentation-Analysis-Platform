from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def generate_report(data, filename):

    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("<b>AI Debate Coach Report</b>", styles["Title"]))

    story.append(Paragraph(f"Topic: {data['topic']}", styles["BodyText"]))

    story.append(Paragraph(f"Score: {data['score']}", styles["BodyText"]))

    story.append(Paragraph(f"Logical Fallacy: {data['logical_fallacy']}", styles["BodyText"]))

    story.append(Paragraph(f"Counter Argument: {data['counter_argument']}", styles["BodyText"]))

    story.append(Paragraph(f"Suggestion: {data['suggestion']}", styles["BodyText"]))

    doc.build(story)