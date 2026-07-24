from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

import sqlite3

from database import get_db, create_tables

from models import (
    UserRegister,
    Profile,
    ProfileUpdate
)

from auth import (
    hash_password,
    verify_password,
    create_access_token
)

from dependencies import (
    get_current_user,
    require_role
)


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="Debate Coach API",
    description="Backend API for Debate Coach & Presentation Analysis",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

create_tables()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Debate Coach API is running"
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/register")
def register(user: UserRegister):

    allowed_roles = [
        "Learner",
        "Coach",
        "Educator",
        "Admin"
    ]

    if user.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    if len(user.password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE username = ?
        """,
        (user.username,)
    )

    existing_user = cursor.fetchone()

    if existing_user:

        conn.close()

        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_password = hash_password(
        user.password
    )

    try:

        cursor.execute(
            """
            INSERT INTO users (
                username,
                password,
                role
            )
            VALUES (?, ?, ?)
            """,
            (
                user.username,
                hashed_password,
                user.role
            )
        )

        conn.commit()

        user_id = cursor.lastrowid

    except sqlite3.Error:

        conn.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to register user"
        )

    finally:

        conn.close()

    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "username": user.username,
        "role": user.role
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE username = ?
        """,
        (form_data.username,)
    )

    user = cursor.fetchone()

    conn.close()

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(
        form_data.password,
        user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token(
        {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================================================
# CURRENT USER
# =========================================================

@app.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):

    return current_user


# =========================================================
# CREATE PROFILE
# =========================================================

@app.post("/profile")
def create_profile(
    profile: Profile,
    current_user=Depends(get_current_user)
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM profiles
        WHERE user_id = ?
        """,
        (current_user["id"],)
    )

    existing_profile = cursor.fetchone()

    if existing_profile:

        conn.close()

        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    try:

        cursor.execute(
            """
            INSERT INTO profiles (
                user_id,
                name,
                experience_level,
                goals,
                preferred_topics
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_user["id"],
                profile.name,
                profile.experience_level,
                profile.goals,
                profile.preferred_topics
            )
        )

        conn.commit()

    except sqlite3.Error:

        conn.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to create profile"
        )

    finally:

        conn.close()

    return {
        "message": "Profile created successfully"
    }


# =========================================================
# GET PROFILE
# =========================================================

@app.get("/profile")
def get_profile(
    current_user=Depends(get_current_user)
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            profiles.id,
            profiles.name,
            profiles.experience_level,
            profiles.goals,
            profiles.preferred_topics,
            users.username,
            users.role

        FROM profiles

        JOIN users
        ON profiles.user_id = users.id

        WHERE profiles.user_id = ?
        """,
        (current_user["id"],)
    )

    profile = cursor.fetchone()

    conn.close()

    if profile is None:

        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return dict(profile)


# =========================================================
# UPDATE PROFILE
# =========================================================

@app.put("/profile")
def update_profile(
    profile: ProfileUpdate,
    current_user=Depends(get_current_user)
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM profiles
        WHERE user_id = ?
        """,
        (current_user["id"],)
    )

    existing_profile = cursor.fetchone()

    if existing_profile is None:

        conn.close()

        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    name = (
        profile.name
        if profile.name is not None
        else existing_profile["name"]
    )

    experience_level = (
        profile.experience_level
        if profile.experience_level is not None
        else existing_profile["experience_level"]
    )

    goals = (
        profile.goals
        if profile.goals is not None
        else existing_profile["goals"]
    )

    preferred_topics = (
        profile.preferred_topics
        if profile.preferred_topics is not None
        else existing_profile["preferred_topics"]
    )

    cursor.execute(
        """
        UPDATE profiles

        SET
            name = ?,
            experience_level = ?,
            goals = ?,
            preferred_topics = ?

        WHERE user_id = ?
        """,
        (
            name,
            experience_level,
            goals,
            preferred_topics,
            current_user["id"]
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Profile updated successfully"
    }


# =========================================================
# LEARNER ROUTE
# =========================================================

@app.get("/learner")
def learner_route(
    current_user=Depends(
        require_role(["Learner"])
    )
):

    return {
        "message": "Learner access granted",
        "user": current_user
    }


# =========================================================
# COACH ROUTE
# =========================================================

@app.get("/coach")
def coach_route(
    current_user=Depends(
        require_role(["Coach"])
    )
):

    return {
        "message": "Coach access granted",
        "user": current_user
    }


# =========================================================
# EDUCATOR ROUTE
# =========================================================

@app.get("/educator")
def educator_route(
    current_user=Depends(
        require_role(["Educator"])
    )
):

    return {
        "message": "Educator access granted",
        "user": current_user
    }


# =========================================================
# ADMIN ROUTE
# =========================================================

@app.get("/admin")
def admin_route(
    current_user=Depends(
        require_role(["Admin"])
    )
):

    return {
        "message": "Admin access granted",
        "user": current_user
    }


# =========================================================
# ADMIN - GET USERS
# =========================================================

@app.get("/admin/users")
def get_all_users(
    current_user=Depends(
        require_role(["Admin"])
    )
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            username,
            role
        FROM users
        """
    )

    users = cursor.fetchall()

    conn.close()

    return [
        dict(user)
        for user in users
    ]


# =========================================================
# ADMIN - DELETE USER
# =========================================================

@app.delete("/admin/users/{user_id}")
def delete_user(
    user_id: int,
    current_user=Depends(
        require_role(["Admin"])
    )
):

    if user_id == current_user["id"]:

        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    )

    user = cursor.fetchone()

    if user is None:

        conn.close()

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    cursor.execute(
        """
        DELETE FROM profiles
        WHERE user_id = ?
        """,
        (user_id,)
    )

    cursor.execute(
        """
        DELETE FROM users
        WHERE id = ?
        """,
        (user_id,)
    )

    conn.commit()
    conn.close()

    return {
        "message": "User deleted successfully"
    }