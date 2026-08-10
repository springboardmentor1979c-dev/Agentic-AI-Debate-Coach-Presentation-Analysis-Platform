from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserProfileCreate(BaseModel):
    name: str
    experience: str
    goals: str
    preferred_topics: str