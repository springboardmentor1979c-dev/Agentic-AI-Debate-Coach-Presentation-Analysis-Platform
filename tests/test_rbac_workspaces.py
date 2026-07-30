import os
import pytest
from fastapi.testclient import TestClient

# Mock environment variable for providers
os.environ["LLM_PROVIDER"] = "mock"

from main import app
from database import get_db, create_tables

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_rbac_test_db():
    create_tables()
    conn = get_db()
    cursor = conn.cursor()
    # Clean up any potential test users and any existing Admin to allow registration
    cursor.execute("DELETE FROM users WHERE username IN ('rbac_learner', 'rbac_coach', 'rbac_educator', 'rbac_admin')")
    cursor.execute("DELETE FROM users WHERE role = 'Admin'")
    conn.commit()
    conn.close()
    yield

def test_rbac_workspace_access_and_endpoints():
    # 1. Register users with different roles
    roles = {
        "rbac_learner": "Learner",
        "rbac_coach": "Coach",
        "rbac_educator": "Educator",
        "rbac_admin": "Admin"
    }
    
    tokens = {}
    user_ids = {}
    
    for username, role in roles.items():
        reg_res = client.post("/register", json={
            "username": username,
            "password": "password123",
            "role": role
        })
        assert reg_res.status_code == 200 or "already exists" in reg_res.text
        
        login_res = client.post("/login", data={
            "username": username,
            "password": "password123"
        })
        assert login_res.status_code == 200
        tokens[role] = login_res.json()["access_token"]
        
        me_res = client.get("/me", headers={"Authorization": f"Bearer {tokens[role]}"})
        user_ids[role] = me_res.json()["id"]

    # 2. Verify Role Access Matrix (403 Forbidden checks)
    # Learner should NOT access coach, educator, admin
    assert client.get("/coach", headers={"Authorization": f"Bearer {tokens['Learner']}"}).status_code == 403
    assert client.get("/educator", headers={"Authorization": f"Bearer {tokens['Learner']}"}).status_code == 403
    assert client.get("/admin", headers={"Authorization": f"Bearer {tokens['Learner']}"}).status_code == 403

    # Coach should NOT access admin or educator
    assert client.get("/admin", headers={"Authorization": f"Bearer {tokens['Coach']}"}).status_code == 403
    
    # Educator should NOT access admin or coach
    assert client.get("/admin", headers={"Authorization": f"Bearer {tokens['Educator']}"}).status_code == 403

    # Admin should access ALL base routes (Learner, Coach, Educator, Admin)
    assert client.get("/learner", headers={"Authorization": f"Bearer {tokens['Admin']}"}).status_code == 200
    assert client.get("/coach", headers={"Authorization": f"Bearer {tokens['Admin']}"}).status_code == 200
    assert client.get("/educator", headers={"Authorization": f"Bearer {tokens['Admin']}"}).status_code == 200
    assert client.get("/admin", headers={"Authorization": f"Bearer {tokens['Admin']}"}).status_code == 200

    # 3. Test Coach Workspace Endpoints
    coach_headers = {"Authorization": f"Bearer {tokens['Coach']}"}
    
    overview_res = client.get("/coach/overview", headers=coach_headers)
    assert overview_res.status_code == 200
    assert "learner_count" in overview_res.json()
    
    learners_res = client.get("/coach/learners", headers=coach_headers)
    assert learners_res.status_code == 200
    assert isinstance(learners_res.json(), list)

    # 4. Test Educator Workspace Endpoints
    educator_headers = {"Authorization": f"Bearer {tokens['Educator']}"}
    
    ed_overview_res = client.get("/educator/overview", headers=educator_headers)
    assert ed_overview_res.status_code == 200
    assert "total_students" in ed_overview_res.json()
    
    ed_rankings_res = client.get("/educator/rankings", headers=educator_headers)
    assert ed_rankings_res.status_code == 200
    assert isinstance(ed_rankings_res.json(), list)

    # 5. Test Admin Workspace Endpoints
    admin_headers = {"Authorization": f"Bearer {tokens['Admin']}"}
    
    adm_overview_res = client.get("/admin/overview", headers=admin_headers)
    assert adm_overview_res.status_code == 200
    assert "total_users" in adm_overview_res.json()
    
    ai_monitoring_res = client.get("/admin/ai-monitoring", headers=admin_headers)
    assert ai_monitoring_res.status_code == 200
    assert "total_requests" in ai_monitoring_res.json()

    # 6. Test User Role Update (restricted to Admin)
    # Learner attempts to change Coach's role (Expected 403)
    unauthorized_patch = client.patch(
        f"/admin/users/{user_ids['Coach']}/role",
        json={"role": "Admin"},
        headers={"Authorization": f"Bearer {tokens['Learner']}"}
    )
    assert unauthorized_patch.status_code == 403
    
    # Admin changes Learner's role to Coach (Expected 200)
    authorized_patch = client.patch(
        f"/admin/users/{user_ids['Learner']}/role",
        json={"role": "Coach"},
        headers=admin_headers
    )
    assert authorized_patch.status_code == 200
