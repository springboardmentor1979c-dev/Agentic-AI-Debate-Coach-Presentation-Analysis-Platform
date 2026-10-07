import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Agentic AI Debate Coach"
    API_V1_STR: str = ""
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-me-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/debate_coach"
    )
    
    # Testing flag
    TESTING: bool = os.getenv("TESTING", "false").lower() in ("true", "1", "yes")

settings = Settings()
