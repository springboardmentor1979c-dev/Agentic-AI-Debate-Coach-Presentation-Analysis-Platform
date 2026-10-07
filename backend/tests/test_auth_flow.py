import unittest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database.db import get_db, Base
from backend.app.models.models import User, Profile, DebateSession, RefreshToken

# Setup test SQLite database
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class AuthFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def setUp(self):
        self.client = TestClient(app)
        self.db = TestingSessionLocal()
        # Clean up database to avoid unique constraint violations
        self.db.query(DebateSession).delete()
        self.db.query(Profile).delete()
        self.db.query(RefreshToken).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.email = f"test-{uuid4().hex[:8]}@example.com"

    def tearDown(self):
        self.db.close()

    def test_register_login_and_profile_flow(self):
        # Register User
        register_response = self.client.post(
            "/register",
            json={
                "name": "Test User",
                "email": self.email,
                "password": "StrongPass123!",
                "role": "Learner",
            },
        )
        self.assertEqual(register_response.status_code, 201)
        self.assertEqual(register_response.json()["email"], self.email)

        # Login User
        login_response = self.client.post(
            "/login",
            data={"username": self.email, "password": "StrongPass123!"},
        )
        self.assertEqual(login_response.status_code, 200)
        token_data = login_response.json()
        token = token_data["access_token"]
        refresh_token = token_data["refresh_token"]
        self.assertTrue(token)
        self.assertTrue(refresh_token)

        headers = {"Authorization": f"Bearer {token}"}

        # Retrieve Profile
        profile_get_response = self.client.get("/profile", headers=headers)
        self.assertEqual(profile_get_response.status_code, 200)
        self.assertEqual(profile_get_response.json()["name"], "Test User")
        self.assertEqual(profile_get_response.json()["experience_level"], "Beginner")

        # Update Profile
        profile_update_response = self.client.put(
            "/profile",
            json={
                "experience_level": "Intermediate",
                "learning_goals": "Improve public speaking",
                "preferred_topics": "AI, ethics",
                "presentation_domains": "Technology",
                "coaching_preferences": "Video review"
            },
            headers=headers,
        )
        self.assertEqual(profile_update_response.status_code, 200)
        self.assertEqual(profile_update_response.json()["experience_level"], "Intermediate")

        # Get updated Profile
        profile_get_updated = self.client.get("/profile", headers=headers)
        self.assertEqual(profile_get_updated.json()["experience_level"], "Intermediate")
        self.assertEqual(profile_get_updated.json()["learning_goals"], "Improve public speaking")

    def test_role_restriction(self):
        coach_email = f"coach-{uuid4().hex[:8]}@example.com"
        
        # Register a Coach
        register_response = self.client.post(
            "/register",
            json={
                "name": "Coach User",
                "email": coach_email,
                "password": "StrongPass123!",
                "role": "Coach",
            },
        )
        self.assertEqual(register_response.status_code, 201)

        # Login Coach
        login_response = self.client.post(
            "/login",
            data={"username": coach_email, "password": "StrongPass123!"},
        )
        self.assertEqual(login_response.status_code, 200)

        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Try to access learner-only dashboard (should get 403)
        learner_response = self.client.get("/learner", headers=headers)
        self.assertEqual(learner_response.status_code, 403)

        # Try to access coach dashboard (should succeed 200)
        coach_response = self.client.get("/coach", headers=headers)
        self.assertEqual(coach_response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
