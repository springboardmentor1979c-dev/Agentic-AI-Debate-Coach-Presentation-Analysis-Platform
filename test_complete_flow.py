"""Dependency-free HTTP integration test for the authentication/profile flow."""

import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request


PORT = 8765
BASE_URL = f"http://127.0.0.1:{PORT}"


def request(method, path, body=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE_URL + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=3) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read())


def expect(status, actual, message):
    if status != actual:
        raise AssertionError(f"{message}: expected {status}, received {actual}")


with tempfile.TemporaryDirectory() as temp_directory:
    environment = os.environ.copy()
    environment["DATABASE_PATH"] = os.path.join(temp_directory, "integration.db")
    server = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(PORT)],
        env=environment,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        for _ in range(30):
            try:
                if request("GET", "/")[0] == 200:
                    break
            except urllib.error.URLError:
                time.sleep(0.1)
        else:
            raise RuntimeError("Test server did not start")

        tokens = {}
        for username, role in (("learner", "Learner"), ("coach", "Coach"), ("educator", "Educator"), ("admin", "Admin")):
            status, _ = request("POST", "/register", {"username": username, "password": "StrongPass123", "role": role})
            expect(201, status, f"register {role}")
            status, response = request("POST", "/login", {"username": username, "password": "StrongPass123"})
            expect(200, status, f"login {role}")
            assert response["token_type"] == "bearer" and response["access_token"]
            tokens[role] = response["access_token"]

        profile = {"name": "Learner One", "experience_level": "Beginner", "goals": ["Improve rebuttals"], "preferred_topics": ["Technology"]}
        status, _ = request("POST", "/profile", profile, tokens["Learner"])
        expect(201, status, "create profile")
        profile["experience_level"] = "Intermediate"
        status, response = request("PUT", "/profile", profile, tokens["Learner"])
        expect(200, status, "update profile")
        assert response["experience_level"] == "Intermediate"
        status, response = request("GET", "/profile", token=tokens["Learner"])
        expect(200, status, "get profile")
        assert response["goals"] == ["Improve rebuttals"]

        dashboard_cases = (("Learner", "/dashboard/learner"), ("Coach", "/dashboard/coach"), ("Educator", "/dashboard/educator"))
        for allowed_role, path in dashboard_cases:
            status, _ = request("GET", path, token=tokens[allowed_role])
            expect(200, status, f"allow {allowed_role} dashboard")
            wrong_role = "Coach" if allowed_role == "Learner" else "Learner"
            status, _ = request("GET", path, token=tokens[wrong_role])
            expect(403, status, f"block {wrong_role} from {allowed_role} dashboard")
        status, _ = request("GET", "/admin/users", token=tokens["Admin"])
        expect(200, status, "allow admin users")
        status, _ = request("GET", "/admin/users", token=tokens["Learner"])
        expect(403, status, "block learner from admin users")
        status, _ = request("GET", "/profile")
        expect(401, status, "block missing token")
        status, _ = request("GET", "/profile", token="not-a-valid-jwt")
        expect(401, status, "block malformed token")
        print("PASS: register -> login -> JWT -> create/update/get profile and role restrictions")
    finally:
        server.terminate()
        server.wait(timeout=5)
