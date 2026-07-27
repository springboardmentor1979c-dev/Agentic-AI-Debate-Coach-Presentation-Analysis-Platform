import sys

sys.path.insert(0, ".")
print("Testing imports...")

# Test models
from models.models import User, UserProfile, DebateSession, Argument, FallacyDetection, Counterargument
print("[OK] Models OK")

# Test schemas
from schemas.schemas import UserRegister, TokenResponse, UserOut, ProfileOut
print("[OK] Schemas OK")

# Test utils
from utils.auth import hash_password, verify_password, create_access_token
print("[OK] Utils OK")

# Test services
from services.llm_engine import call_llm, parse_llm_json
print("[OK] LLM Engine OK")

from services.analysis import analyze_argument, detect_fallacies, generate_counterarguments
print("[OK] Analysis OK")

from services.presentation import analyze_presentation
print("[OK] Presentation OK")

from services.scoring import compute_debate_score, generate_recommendations, compute_percentile
print("[OK] Scoring OK")

from services.cache import cache_get, cache_set
print("[OK] Cache OK")

from services.vector_store import add_to_vector_store, semantic_search
print("[OK] Vector Store OK")

from services.kafka_producer import publish_analysis_event
print("[OK] Kafka OK")

from services.agent_orchestrator import run_full_analysis_pipeline, coach_agent
print("[OK] Agent Orchestrator OK")

# Test routers
from routers.auth import router as auth_router
from routers.profile import router as profile_router
from routers.debates import router as debates_router
from routers.arguments import router as arguments_router
from routers.presentations import router as presentations_router
from routers.scoring import router as scoring_router
from routers.dashboard import router as dashboard_router
from routers.reports import router as reports_router
from routers.notifications import router as notifications_router
from routers.admin import router as admin_router
from routers.ai_debate import router as ai_debate_router
from routers.coaching import router as coaching_router
from routers.analytics import router as analytics_router
from routers.search import router as search_router
print("[OK] All Routers OK")

# Test main app
from main import app
print("[OK] Main App OK")

print("\nAll imports successful!")
