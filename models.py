from sqlalchemy import Column, Integer, String
from database import Base

# User Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

# User Profile Table
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    experience = Column(String)
    goals = Column(String)
    preferred_topics = Column(String)