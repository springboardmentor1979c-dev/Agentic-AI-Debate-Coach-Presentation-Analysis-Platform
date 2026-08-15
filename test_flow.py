"""
End-to-end test of the full flow:
  register -> login -> JWT -> profile create/update -> role restrictions

Run with: python test_flow.py
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def section(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


# 1. Hello World route
section("1. GET / (Hello World)")
r = client.get("/")
print(r.status_code, r.json())
assert r.status_code == 200

# 2. Register a Learner
section("2. Register a Learner")
r = client.post("/register", json={
    "name": "Asha Kumar", "email": "asha@example.com",
    "password": "strongpass1", "role": "Learner"
})
print(r.status_code, r.json())
assert r.status_code == 201

# 3. Register a Coach and an Admin too (for RBAC tests)
section("3. Register a Coach and an Admin")
r_coach = client.post("/register", json={
    "name": "Coach Rao", "email": "coach@example.com",
    "password": "strongpass1", "role": "Coach"
})
r_admin = client.post("/register", json={
    "name": "Admin Priya", "email": "admin@example.com",
    "password": "strongpass1", "role": "Admin"
})
print("coach:", r_coach.status_code, r_coach.json())
print("admin:", r_admin.status_code, r_admin.json())

# 4. Login as Learner -> get JWT
section("4. Login as Learner (OAuth2 form: username=email)")
r = client.post("/login", data={"username": "asha@example.com", "password": "strongpass1"})
print(r.status_code, r.json())
assert r.status_code == 200
learner_token = r.json()["access_token"]

# 5. Access /me with token
section("5. GET /me with JWT")
headers = {"Authorization": f"Bearer {learner_token}"}
r = client.get("/me", headers=headers)
print(r.status_code, r.json())
assert r.status_code == 200

# 6. Create/update profile
section("6. POST /profile (create profile)")
r = client.post("/profile", headers=headers, json={
    "experience_level": "Intermediate",
    "goals": "Win 3 inter-college debates this year",
    "preferred_topics": "AI Ethics, Climate Policy"
})
print(r.status_code, r.json())
assert r.status_code == 200

section("7. GET /profile")
r = client.get("/profile", headers=headers)
print(r.status_code, r.json())
assert r.status_code == 200

# 8. Try accessing without token -> should fail
section("8. GET /profile WITHOUT token (should be 401)")
r = client.get("/profile")
print(r.status_code, r.json())
assert r.status_code == 401

# 9. Role restriction: Learner tries admin-only endpoint -> should be 403
section("9. Learner hits /admin/users (should be 403 Forbidden)")
r = client.get("/admin/users", headers=headers)
print(r.status_code, r.json())
assert r.status_code == 403

# 10. Admin logs in and hits /admin/users -> should succeed
section("10. Admin logs in and hits /admin/users (should be 200)")
r = client.post("/login", data={"username": "admin@example.com", "password": "strongpass1"})
admin_token = r.json()["access_token"]
admin_headers = {"Authorization": f"Bearer {admin_token}"}
r = client.get("/admin/users", headers=admin_headers)
print(r.status_code, [u["name"] for u in r.json()])
assert r.status_code == 200

# 11. Coach hits /coach/dashboard -> should succeed
section("11. Coach logs in and hits /coach/dashboard (should be 200)")
r = client.post("/login", data={"username": "coach@example.com", "password": "strongpass1"})
coach_token = r.json()["access_token"]
r = client.get("/coach/dashboard", headers={"Authorization": f"Bearer {coach_token}"})
print(r.status_code, r.json())
assert r.status_code == 200

# 12. Learner hits /coach/dashboard -> should be 403
section("12. Learner hits /coach/dashboard (should be 403)")
r = client.get("/coach/dashboard", headers=headers)
print(r.status_code, r.json())
assert r.status_code == 403

print("\n" + "#" * 70)
print("ALL TESTS PASSED ✔  register -> login -> JWT -> profile -> RBAC all work")
print("#" * 70)
