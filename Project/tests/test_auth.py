import os
import sys
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Redirect DB to a temp file before any app module is imported
_tmp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp_db.close()

import database  # noqa: E402
database.DB_PATH = Path(_tmp_db.name)
database.init_db()

from main import app  # noqa: E402

client = TestClient(app)


def _register(email: str, password: str = "secret123", role: str = "learner", name: str = "Test User"):
    return client.post(
        "/auth/register",
        json={"name": name, "email": email, "password": password, "role": role},
    )


def _login(email: str, password: str = "secret123") -> str:
    resp = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class TestRegister:
    def test_register_learner(self):
        resp = _register("learner@example.com", role="learner", name="Alice Learner")
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "learner@example.com"
        assert data["role"] == "learner"
        assert "hashed_password" not in data

    def test_register_coach(self):
        resp = _register("coach@example.com", role="coach", name="Bob Coach")
        assert resp.status_code == 201
        assert resp.json()["role"] == "coach"

    def test_register_educator(self):
        resp = _register("educator@example.com", role="educator", name="Carol Educator")
        assert resp.status_code == 201
        assert resp.json()["role"] == "educator"

    def test_register_admin(self):
        resp = _register("admin@example.com", role="admin", name="Dave Admin")
        assert resp.status_code == 201
        assert resp.json()["role"] == "admin"

    def test_register_duplicate_email(self):
        _register("dup@example.com")
        resp = _register("dup@example.com")
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    def test_register_short_password(self):
        resp = _register("short@example.com", password="abc")
        assert resp.status_code == 422

    def test_register_invalid_role(self):
        resp = client.post(
            "/auth/register",
            json={"name": "X", "email": "x@x.com", "password": "secret123", "role": "superuser"},
        )
        assert resp.status_code == 422


class TestLogin:
    def setup_method(self):
        _register("login_user@example.com", password="mypassword", name="Login User")

    def test_login_success(self):
        resp = client.post(
            "/auth/login",
            data={"username": "login_user@example.com", "password": "mypassword"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    def test_login_wrong_password(self):
        resp = client.post(
            "/auth/login",
            data={"username": "login_user@example.com", "password": "wrongpass"},
        )
        assert resp.status_code == 401

    def test_login_unknown_email(self):
        resp = client.post(
            "/auth/login",
            data={"username": "nobody@example.com", "password": "whatever"},
        )
        assert resp.status_code == 401

    def test_get_me_authenticated(self):
        token = _login("login_user@example.com", "mypassword")
        resp = client.get("/auth/me", headers=_auth_headers(token))
        assert resp.status_code == 200
        assert resp.json()["email"] == "login_user@example.com"

    def test_get_me_unauthenticated(self):
        resp = client.get("/auth/me")
        assert resp.status_code == 401

    def test_get_me_bad_token(self):
        resp = client.get("/auth/me", headers={"Authorization": "Bearer not.a.real.token"})
        assert resp.status_code == 401


class TestProfile:
    def setup_method(self):
        _register("prof_user@example.com", name="Profile User")
        self.token = _login("prof_user@example.com")
        self.headers = _auth_headers(self.token)

    def test_get_profile_not_found(self):
        resp = client.get("/profile/me", headers=self.headers)
        assert resp.status_code == 404

    def test_create_profile(self):
        resp = client.put(
            "/profile/me",
            json={
                "experience": "2 years of Python",
                "goals": "Become a senior developer",
                "preferred_topics": "Python,FastAPI,Testing",
            },
            headers=self.headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["experience"] == "2 years of Python"
        assert data["goals"] == "Become a senior developer"
        assert data["preferred_topics"] == "Python,FastAPI,Testing"

    def test_get_profile_after_creation(self):
        client.put(
            "/profile/me",
            json={
                "experience": "5 years",
                "goals": "Lead a team",
                "preferred_topics": "Leadership,Python",
            },
            headers=self.headers,
        )
        resp = client.get("/profile/me", headers=self.headers)
        assert resp.status_code == 200
        assert resp.json()["experience"] == "5 years"

    def test_update_profile(self):
        client.put(
            "/profile/me",
            json={"experience": "1 year", "goals": "Get hired", "preferred_topics": "JS"},
            headers=self.headers,
        )
        resp = client.put(
            "/profile/me",
            json={"experience": "3 years", "goals": "Start a startup", "preferred_topics": "Python,ML"},
            headers=self.headers,
        )
        assert resp.status_code == 200
        assert resp.json()["experience"] == "3 years"
        assert resp.json()["goals"] == "Start a startup"

    def test_profile_requires_auth(self):
        resp = client.get("/profile/me")
        assert resp.status_code == 401

        resp = client.put(
            "/profile/me",
            json={"experience": "x", "goals": "y", "preferred_topics": "z"},
        )
        assert resp.status_code == 401


def _register_or_login(email: str, password: str = "secret123", role: str = "learner", name: str = "Test User") -> tuple[int, str]:
    """Register if not already registered; always returns (user_id, token)."""
    resp = _register(email, password, role, name)
    if resp.status_code == 201:
        user_id = resp.json()["id"]
    else:
        token = _login(email, password)
        me = client.get("/auth/me", headers=_auth_headers(token))
        user_id = me.json()["id"]
    token = _login(email, password)
    return user_id, token


class TestRBAC:
    def setup_method(self):
        _, self.admin_token = _register_or_login("rbac_admin@example.com", role="admin", name="RBAC Admin")
        self.admin_headers = _auth_headers(self.admin_token)

        _, self.educator_token = _register_or_login("rbac_educator@example.com", role="educator", name="RBAC Educator")
        self.educator_headers = _auth_headers(self.educator_token)

        self.learner_id, self.learner_token = _register_or_login("rbac_learner@example.com", role="learner", name="RBAC Learner")
        self.learner_headers = _auth_headers(self.learner_token)

        client.put(
            "/profile/me",
            json={
                "experience": "beginner",
                "goals": "learn",
                "preferred_topics": "HTML,CSS",
            },
            headers=self.learner_headers,
        )

    def test_admin_can_view_learner_profile(self):
        resp = client.get(f"/profile/{self.learner_id}", headers=self.admin_headers)
        assert resp.status_code == 200
        assert resp.json()["user_id"] == self.learner_id

    def test_educator_can_view_learner_profile(self):
        resp = client.get(f"/profile/{self.learner_id}", headers=self.educator_headers)
        assert resp.status_code == 200

    def test_learner_cannot_view_others_profile(self):
        admin_resp = _register("another_admin@example.com", role="admin", name="Another Admin")
        admin_id = admin_resp.json()["id"]
        resp = client.get(f"/profile/{admin_id}", headers=self.learner_headers)
        assert resp.status_code == 403

    def test_coach_cannot_view_others_profile(self):
        _register("rbac_coach2@example.com", role="coach", name="Coach Two")
        coach_token = _login("rbac_coach2@example.com")
        coach_headers = _auth_headers(coach_token)
        resp = client.get(f"/profile/{self.learner_id}", headers=coach_headers)
        assert resp.status_code == 403
