import os
from dotenv import load_dotenv

load_dotenv()

# ── JWT ───────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "debate-coach-secret-key-2024-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))  # 24h

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./debate_coach.db")

# ── LLM Providers ─────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")          # openai | anthropic | mock
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0.7))
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", 1024))

# ── Redis Cache ───────────────────────────────────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", 300))

# ── Kafka ─────────────────────────────────────────────────────────────────────
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_ENABLED = os.getenv("KAFKA_ENABLED", "false").lower() == "true"
KAFKA_TOPIC_ANALYSIS = "debate.analysis"
KAFKA_TOPIC_NOTIFICATIONS = "debate.notifications"
KAFKA_TOPIC_SCORING = "debate.scoring"

# ── Vector Store ──────────────────────────────────────────────────────────────
VECTOR_STORE_TYPE = os.getenv("VECTOR_STORE_TYPE", "faiss")   # faiss | pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "debate-coach")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./faiss_index")
EMBEDDING_DIM = 384   # sentence-transformers/all-MiniLM-L6-v2 dimension

# ── Rate Limiting ─────────────────────────────────────────────────────────────
RATE_LIMIT_DEFAULT = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")
RATE_LIMIT_AUTH = os.getenv("RATE_LIMIT_AUTH", "10/minute")
RATE_LIMIT_AI = os.getenv("RATE_LIMIT_AI", "20/minute")

# ── External Services ─────────────────────────────────────────────────────────
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@debatecoach.ai")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "debate-coach-media")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

OAUTH_REDIRECT_BASE_URL = os.getenv("OAUTH_REDIRECT_BASE_URL", "http://localhost:8000")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

WHISPER_ENABLED = os.getenv("WHISPER_ENABLED", "false").lower() == "true"

# ── App ───────────────────────────────────────────────────────────────────────
APP_ENV = os.getenv("APP_ENV", "development")
APP_VERSION = "2.0.0"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080").split(",")
