import os
import pytest
from fastapi.testclient import TestClient

# Mock environment variable for providers
os.environ["LLM_PROVIDER"] = "mock"

from main import app
from database import get_db, create_tables

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    create_tables()
    # Clean up test users from previous runs
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username IN ('testlearner', 'esteducator')")
    conn.commit()
    conn.close()
    yield

def test_user_authentication_flow():
    # 1. Register a Learner
    reg_response = client.post("/register", json={
        "username": "testlearner",
        "password": "password123",
        "role": "Learner"
    })
    assert reg_response.status_code == 200
    
    # 2. Login
    login_response = client.post("/login", data={
        "username": "testlearner",
        "password": "password123"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    assert token is not None

    # 3. Get current user
    me_response = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["username"] == "testlearner"

def test_profile_management():
    # Login to retrieve token
    login_response = client.post("/login", data={
        "username": "testlearner",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    # Create profile
    profile_data = {
        "name": "Test Learner Profile",
        "experience_level": "Beginner",
        "goals": "Practice counterarguments and pacing",
        "preferred_topics": "AI, Education",
        "presentation_domains": "Keynotes",
        "coaching_preferences": "Direct reviews",
        "communication_skill_tracking": "verbal=70"
    }
    create_res = client.post("/profile", json=profile_data, headers={"Authorization": f"Bearer {token}"})
    assert create_res.status_code == 200

    # Get profile
    get_res = client.get("/profile", headers={"Authorization": f"Bearer {token}"})
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Test Learner Profile"

def test_debate_workflow():
    login_response = client.post("/login", data={
        "username": "testlearner",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    # Start practice
    start_res = client.post("/practice/start", json={
        "topic": "School uniforms should be banned",
        "format": "One-on-One",
        "position": "Affirmative",
        "difficulty": "Intermediate"
    }, headers={"Authorization": f"Bearer {token}"})
    assert start_res.status_code == 200
    session_id = start_res.json()["session_id"]

    # Submit turn
    turn_res = client.post(f"/practice/sessions/{session_id}/turn", json={
        "content": "School uniforms restrict individual freedom of expression and limit development."
    }, headers={"Authorization": f"Bearer {token}"})
    assert turn_res.status_code == 200
    assert "ai_content" in turn_res.json()

    # End session
    end_res = client.post(f"/practice/sessions/{session_id}/end", headers={"Authorization": f"Bearer {token}"})
    assert end_res.status_code == 200
    assert "scores" in end_res.json()

def test_presentation_analysis():
    # Audio upload validation checks
    login_response = client.post("/login", data={
        "username": "testlearner",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    # Create dummy empty file
    with open("dummy_audio.wav", "wb") as f:
        f.write(b"")

    try:
        # Should raise empty audio error (400 validation check)
        with open("dummy_audio.wav", "rb") as f:
            up_res = client.post("/presentation/upload", files={"file": ("dummy_audio.wav", f, "audio/wav")}, headers={"Authorization": f"Bearer {token}"})
        assert up_res.status_code == 400
    finally:
        if os.path.exists("dummy_audio.wav"):
            os.remove("dummy_audio.wav")

def test_role_restrictions():
    # Educator registration & routing check
    reg_response = client.post("/register", json={
        "username": "esteducator",
        "password": "password123",
        "role": "Educator"
    })
    assert reg_response.status_code == 200

    login_response = client.post("/login", data={
        "username": "esteducator",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    # Accessing role workspaces
    educator_res = client.get("/educator", headers={"Authorization": f"Bearer {token}"})
    assert educator_res.status_code == 200

    # Learner should be forbidden from educator route
    l_login = client.post("/login", data={
        "username": "testlearner",
        "password": "password123"
    })
    l_token = l_login.json()["access_token"]
    forbidden_res = client.get("/educator", headers={"Authorization": f"Bearer {l_token}"})
    assert forbidden_res.status_code == 403
