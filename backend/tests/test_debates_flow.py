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

class DebateSessionsFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def setUp(self):
        self.client = TestClient(app)
        self.db = TestingSessionLocal()
        
        # Clean up database to avoid conflicts
        self.db.query(DebateSession).delete()
        self.db.query(Profile).delete()
        self.db.query(RefreshToken).delete()
        self.db.query(User).delete()
        self.db.commit()
        
        # Create users
        self.user1_email = f"user1-{uuid4().hex[:8]}@example.com"
        self.user2_email = f"user2-{uuid4().hex[:8]}@example.com"
        
        self.client.post("/register", json={"name": "User One", "email": self.user1_email, "password": "Password123!", "role": "Learner"})
        self.client.post("/register", json={"name": "User Two", "email": self.user2_email, "password": "Password123!", "role": "Learner"})
        
        # Logins
        login1 = self.client.post("/login", data={"username": self.user1_email, "password": "Password123!"})
        login2 = self.client.post("/login", data={"username": self.user2_email, "password": "Password123!"})
        
        self.token1 = login1.json()["access_token"]
        self.token2 = login2.json()["access_token"]
        
        self.headers1 = {"Authorization": f"Bearer {self.token1}"}
        self.headers2 = {"Authorization": f"Bearer {self.token2}"}

    def tearDown(self):
        self.db.close()

    def test_debate_crud_flow(self):
        # 1. Create a debate
        create_res = self.client.post(
            "/debates",
            json={
                "title": "Climate Change Debate",
                "topic": "Should carbon tax be globally mandatory?",
                "format": "Oxford",
                "position": "Affirmative",
                "status": "Scheduled"
            },
            headers=self.headers1
        )
        self.assertEqual(create_res.status_code, 201)
        debate_id = create_res.json()["id"]
        self.assertEqual(create_res.json()["title"], "Climate Change Debate")

        # 2. List debates (User 1 should see 1 debate, User 2 should see 0)
        list_res1 = self.client.get("/debates", headers=self.headers1)
        self.assertEqual(len(list_res1.json()), 1)
        
        list_res2 = self.client.get("/debates", headers=self.headers2)
        self.assertEqual(len(list_res2.json()), 0)

        # 3. View debate details
        get_res = self.client.get(f"/debates/{debate_id}", headers=self.headers1)
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["title"], "Climate Change Debate")

        # 4. View debate permissions check (User 2 should get 403 Forbidden)
        get_res2 = self.client.get(f"/debates/{debate_id}", headers=self.headers2)
        self.assertEqual(get_res2.status_code, 403)

        # 5. Update debate
        update_res = self.client.put(
            f"/debates/{debate_id}",
            json={
                "title": "Updated Climate Debate",
                "status": "In Progress"
            },
            headers=self.headers1
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["title"], "Updated Climate Debate")
        self.assertEqual(update_res.json()["status"], "In Progress")

        # 6. Delete debate (User 2 should get 403 Forbidden)
        del_res2 = self.client.delete(f"/debates/{debate_id}", headers=self.headers2)
        self.assertEqual(del_res2.status_code, 403)

        # 7. Delete debate (User 1 should succeed)
        del_res = self.client.delete(f"/debates/{debate_id}", headers=self.headers1)
        self.assertEqual(del_res.status_code, 200)

        # 8. Verify deleted
        get_res3 = self.client.get(f"/debates/{debate_id}", headers=self.headers1)
        self.assertEqual(get_res3.status_code, 404)


if __name__ == "__main__":
    unittest.main()
