from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "Learner"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class ProfileCreate(BaseModel):
    name: str
    experience_level: str
    goals: str
    preferred_topics: str


class ProfileResponse(BaseModel):
    id: int
    name: str
    experience_level: str
    goals: str
    preferred_topics: str
    user_id: int

    class Config:
        from_attributes = True