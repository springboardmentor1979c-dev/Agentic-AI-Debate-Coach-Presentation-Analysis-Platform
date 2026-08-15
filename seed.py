"""
Run this once to create the dummy SQLite database (debate_coach.db)
and insert one sample user, as requested in the project brief.

    python seed.py
"""
from app.database import engine, SessionLocal, Base
from app import models, auth

Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing = db.query(models.User).filter(models.User.email == "sample.user@example.com").first()
if existing:
    print("Sample user already exists, skipping insert.")
else:
    sample_user = models.User(
        name="Sample User",
        email="sample.user@example.com",
        hashed_password=auth.hash_password("password123"),
        role=models.RoleEnum.learner,
    )
    db.add(sample_user)
    db.commit()
    db.refresh(sample_user)

    profile = models.UserProfile(
        user_id=sample_user.id,
        experience_level="Beginner",
        goals="Improve public speaking confidence",
        preferred_topics="Politics, Technology",
    )
    db.add(profile)
    db.commit()

    print(f"Inserted sample user: id={sample_user.id}, name={sample_user.name}, role={sample_user.role.value}")

db.close()
print("Database ready: debate_coach.db")
