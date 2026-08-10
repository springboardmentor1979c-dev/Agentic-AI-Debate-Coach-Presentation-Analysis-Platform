from sqlalchemy import Column, Integer, String, Text, ForeignKey
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

class Debate(Base):
    __tablename__ = "debates"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    argument = Column(Text, nullable=False)
    user_email = Column(String, nullable=False)