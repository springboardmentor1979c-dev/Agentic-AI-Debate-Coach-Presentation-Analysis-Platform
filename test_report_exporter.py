"""Unit tests for the Reports & Export System."""

import time
from database import initialize_database, connection_scope
from report_exporter import ReportExportSystem


def test_reports_and_export_system():
    initialize_database()
    exporter = ReportExportSystem()
    test_email = f"report_user_{int(time.time())}@test.com"

    with connection_scope() as conn:
        # Create test user
        cursor = conn.execute("INSERT INTO users (name, role, email) VALUES ('Report Tester', 'Learner', ?)", (test_email,))
        user_id = cursor.lastrowid

        # Insert test argument analysis
        arg_cur = conn.execute(
            """INSERT INTO argument_analyses (
                user_id, title, topic, speech_text, overall_score, clarity_score, relevance_score,
                evidence_score, logic_score, persuasiveness_score, credibility_score, credibility_level, analysis_json
            ) VALUES (?, 'Test Speech', 'Topic X', 'Text', 80, 80, 85, 75, 80, 80, 80, 'High', '{}')""",
            (user_id,),
        )
        arg_id = arg_cur.lastrowid

        # 1. Test Debate Report
        debate_rep = exporter.get_debate_report(arg_id, conn)
        assert debate_rep["report_type"] == "Debate Report"
        assert debate_rep["overall_score"] == 80

        # 2. Test Excel Export (CSV)
        excel_str = exporter.export_excel(debate_rep)
        assert "Metric / Field,Value" in excel_str
        assert "Debate Report" in excel_str

        # 3. Test PDF Export
        pdf_bytes = exporter.export_pdf(debate_rep)
        assert pdf_bytes.startswith(b"%PDF-1.4")
        assert b"Debate Report" in pdf_bytes

        # 4. Test Learning Progress Report
        prog_rep = exporter.get_learning_progress_report(user_id, conn)
        assert prog_rep["report_type"] == "Learning Progress Report"
        assert prog_rep["user_id"] == user_id


if __name__ == "__main__":
    print("Running Reports & Export System tests...")
    test_reports_and_export_system()
    print("[PASS] test_reports_and_export_system (JSON, Excel CSV, and PDF Export verified)")
    print("All report exporter tests passed successfully!")
