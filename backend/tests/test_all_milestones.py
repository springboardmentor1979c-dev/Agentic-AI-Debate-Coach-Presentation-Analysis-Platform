import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database.db import get_db, Base
from backend.app.models.models import User, DebateSession, DebateRound, Argument

# Setup test SQLite database
TEST_DATABASE_URL = "sqlite:///./test_all_milestones.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply FastAPI dependency override
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Create a test user
    test_user = db.query(User).filter(User.email == "tester_milestones@example.com").first()
    if not test_user:
        from backend.app.core.security import hash_password
        test_user = User(
            name="Milestone Tester",
            email="tester_milestones@example.com",
            password=hash_password("testpassword123"),
            role="Learner"
        )
        db.add(test_user)
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

# Static cache to avoid duplicate login calls triggering database constraint errors
_cached_auth_headers = None

def get_auth_headers():
    global _cached_auth_headers
    if _cached_auth_headers is None:
        response = client.post("/login", data={
            "username": "tester_milestones@example.com",
            "password": "testpassword123"
        })
        if response.status_code == 200:
            token = response.json().get("access_token")
            _cached_auth_headers = {"Authorization": f"Bearer {token}"}
        else:
            _cached_auth_headers = {}
    return _cached_auth_headers


# ==========================================
# WEEK 2 TESTS: Argument Analysis
# ==========================================

def test_argument_extraction_unit():
    from backend.app.ai.argument_analysis.argument_extractor import ArgumentExtractor
    extractor = ArgumentExtractor()
    text = "Universal Basic Income is necessary. Therefore, we should implement it."
    result = extractor.extract(text)
    
    assert "claim" in result
    assert "premise" in result
    assert "conclusion" in result
    assert result["confidence"] >= 0.0

def test_fallacy_detection_unit():
    from backend.app.ai.fallacy_detection.fallacy_detector import FallacyDetector
    detector = FallacyDetector()
    text = "You wouldn't understand this policy because you are young."
    result = detector.detect(text)
    
    assert isinstance(result, list)
    if result:
        assert "fallacy_type" in result[0]
        assert "severity" in result[0]

def test_reasoning_evaluation_unit():
    from backend.app.ai.reasoning_engine.reasoning_evaluator import ReasoningEvaluator
    evaluator = ReasoningEvaluator()
    text = "Automation reduces jobs. Jobless workers need income. Therefore, UBI is useful."
    result = evaluator.evaluate(text)
    
    assert "logical_flow" in result
    assert "overall_quality" in result

def test_argument_scoring_unit():
    from backend.app.ai.scoring_engine.quality_scorer import QualityScorer
    scorer = QualityScorer()
    scores = scorer.calculate(80, 80, 80, 80, 80)
    assert scores["overall_score"] == 80.0

def test_argument_improver_unit():
    from backend.app.ai.argument_analysis.argument_improver import ArgumentImprover
    improver = ArgumentImprover()
    result = improver.improve("UBI is good because jobs are gone.")
    assert "improved_argument" in result
    assert "wording_tips" in result

def test_analyze_endpoint_api():
    headers = get_auth_headers()
    
    # 1. Create a session first
    session_response = client.post("/debates", json={
        "title": "UBI Debate",
        "topic": "UBI as an economic stabilizer",
        "format": "One-on-One",
        "position": "Affirmative"
    }, headers=headers)
    assert session_response.status_code == 201
    session_id = session_response.json().get("id")

    # 2. Analyze
    response = client.post("/analyze", json={
        "text": "Universal Basic Income is necessary. Therefore, we should implement it.",
        "debate_session_id": session_id
    }, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert "argument_id" in data
    assert "scores" in data
    assert "fallacies" in data

def test_analyze_endpoint_edge_cases():
    headers = get_auth_headers()
    
    # Empty input
    response = client.post("/analyze", json={"text": "", "debate_session_id": 1}, headers=headers)
    assert response.status_code == 400


# ==========================================
# WEEK 3 TESTS: Debate Simulation & Coaching
# ==========================================

def test_debate_simulation_opponent_unit():
    from backend.app.ai.debate_simulation.debate_opponent import DebateOpponent
    opponent = DebateOpponent()
    
    opening = opponent.generate_opening("UBI", "One-on-One", "Negative", "Critical Thinker", "Intermediate")
    assert "opening_statement" in opening
    
    rebuttal = opponent.generate_rebuttal("UBI", "One-on-One", "Negative", "Critical Thinker", "Intermediate", "I advocate UBI", [])
    assert "rebuttal" in rebuttal

def test_debate_simulation_endpoints_api():
    headers = get_auth_headers()
    
    # 1. Start Debate
    response = client.post("/debate/start", json={
        "topic": "Universal Basic Income",
        "format": "One-on-One",
        "difficulty": "Intermediate",
        "personality": "Friendly Coach",
        "position": "Affirmative"
    }, headers=headers)
    
    assert response.status_code == 201
    session_id = response.json().get("session_id")
    assert session_id is not None
    assert "ai_opening" in response.json()

    # 2. Respond to Debate
    response = client.post("/debate/respond", json={
        "session_id": session_id,
        "message": "UBI provides immediate cash support, reducing extreme poverty levels."
    }, headers=headers)
    
    assert response.status_code == 200
    assert "rebuttal" in response.json()
    assert "coaching" in response.json()

    # 3. Get Performance history
    response = client.get("/debate/performance", headers=headers)
    assert response.status_code == 200
    assert "trends" in response.json()


# ==========================================
# WEEK 4 TESTS: Presentation Analysis & Speech/Video Metrics
# ==========================================

def test_speech_analyzer_unit():
    from backend.app.ai.speech_analysis.vocal_analyzer import SpeechAnalyzer
    analyzer = SpeechAnalyzer()
    res = analyzer.analyze_audio("dummy_path.wav", "Hello, welcome to this presentation on economic metrics.")
    
    assert "scores" in res
    assert "metrics" in res
    assert res["metrics"]["words_per_minute"] > 0

def test_video_analyzer_unit():
    from backend.app.ai.video_analysis.visual_analyzer import VisualAnalyzer
    analyzer = VisualAnalyzer()
    res = analyzer.analyze_video("dummy_path.mp4")
    
    assert "scores" in res
    assert "metrics" in res
    assert "eye_contact" in res["metrics"]

def test_presentation_analysis_endpoints_api():
    headers = get_auth_headers()
    
    # 1. Upload mock file
    response = client.post(
        "/presentation/upload",
        files={"file": ("test_presentation.mp4", b"dummy video file content", "video/mp4")},
        headers=headers
    )
    assert response.status_code == 200
    filepath = response.json().get("filepath")
    transcript = response.json().get("transcript")
    
    # 2. Analyze presentation
    response = client.post("/presentation/analyze", json={
        "filepath": filepath,
        "transcript": transcript,
        "slides_info": "Slide 1: Intro. Slide 2: Automation.",
        "debate_session_id": 1
    }, headers=headers)
    
    assert response.status_code == 200
    assert "scores" in response.json()
    assert "feedback" in response.json()
    assert "pdf_report" in response.json()
    
    # 3. Export CSV
    response = client.post("/export/csv", json={
        "scores": {"communication": 80, "confidence": 75},
        "speech_metrics": {"wpm": 130, "pauses": 4}
    }, headers=headers)
    assert response.status_code == 200
