import os
import tempfile
import unittest

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

test_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
test_db.close()
os.environ["JWT_SECRET"] = "test-secret"

import database
database.DATABASE_PATH = database.Path(test_db.name)
from main import (create_or_update_profile, get_current_user, initialize_database,
                  login, read_profile, register, require_roles, LoginRequest,
                  ProfileRequest, RegisterRequest)


class AuthAndProfileTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        initialize_database()

    @classmethod
    def tearDownClass(cls):
        os.unlink(test_db.name)

    def test_login_and_profile_creation(self):
        email = "learner@example.com"
        registered = register(RegisterRequest(name="Asha", email=email, password="secure-pass-123", role="Learner"))
        token = login(LoginRequest(email=email, password="secure-pass-123"))["access_token"]
        # Verify the JWT is accepted by the authentication dependency.
        user = get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=token))
        self.assertEqual(user["id"], registered["id"])
        profile = create_or_update_profile(ProfileRequest(name="Asha", experience="Beginner", goals="Learn Python", preferred_topics=["Python", "APIs"]), user)
        self.assertEqual(profile["preferred_topics"], ["Python", "APIs"])
        self.assertEqual(read_profile(user)["goals"], "Learn Python")
        self.assertEqual(token.count("."), 2)

    def test_role_restrictions_for_sample_accounts(self):
        accounts = {}
        for role in ("Learner", "Coach", "Educator", "Admin"):
            result = register(RegisterRequest(name=role, email=f"sample-{role.lower()}@example.com", password="secure-pass-123", role=role))
            accounts[role] = {"id": result["id"], "name": role, "email": result["email"], "role": role}

        # Coach/Educator access is permitted; a Learner is denied.
        self.assertEqual(require_roles("Coach", "Educator")(accounts["Coach"])["role"], "Coach")
        self.assertEqual(require_roles("Coach", "Educator")(accounts["Educator"])["role"], "Educator")
        with self.assertRaises(HTTPException) as denied:
            require_roles("Coach", "Educator")(accounts["Learner"])
        self.assertEqual(denied.exception.status_code, 403)

        # Admin-only access rejects non-admin accounts.
        self.assertEqual(require_roles("Admin")(accounts["Admin"])["role"], "Admin")
        with self.assertRaises(HTTPException) as denied:
            require_roles("Admin")(accounts["Coach"])
        self.assertEqual(denied.exception.status_code, 403)
