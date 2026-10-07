from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

db_url = settings.DATABASE_URL

# Automatic fallback to SQLite if PostgreSQL fails to connect
if db_url.startswith("postgresql://") or db_url.startswith("postgresql+psycopg://"):
    temp_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
    try:
        # Test connection
        temp_engine = create_engine(temp_url, connect_args={"connect_timeout": 2})
        conn = temp_engine.connect()
        conn.close()
        db_url = temp_url
    except Exception:
        # Graceful fallback to SQLite
        db_url = "sqlite:///./test.db"

# Adjust sqlite connection args if running with SQLite
engine_kwargs = {}
if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(db_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
