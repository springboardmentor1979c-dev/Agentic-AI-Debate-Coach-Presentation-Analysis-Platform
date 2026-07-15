from fastapi import FastAPI

from database import engine, SessionLocal
from models import Base, User

app = FastAPI()

# Create the database and table
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():

    db = SessionLocal()

    # Check if a user already exists
    existing_user = db.query(User).first()

    if not existing_user:
        sample_user = User(
            name="Ramya",
            role="Learner"
        )

        db.add(sample_user)
        db.commit()

    db.close()

    return {
        "message": "Hello World from FastAPI!",
        "database": "SQLite Connected",
        "sample_user": "Inserted Successfully"
    }