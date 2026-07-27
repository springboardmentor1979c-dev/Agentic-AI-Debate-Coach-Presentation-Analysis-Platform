from fastapi import Header, HTTPException
from fastapi import FastAPI
import sqlite3
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
from jose import JWTError

app = FastAPI()

SECRET_KEY = "mysecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class LoginData(BaseModel):
    username: str
    password: str

class RegisterData(BaseModel):
    username: str
    password: str
    role: str

class ProfileData(BaseModel):
    name: str
    experience: str
    goals: str
    preferred_topics: str

@app.get("/")
def hello():
    return {"message": "Hello World"}

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None
    
def require_role(token: str, allowed_roles: list):

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    if payload["role"] not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Access Denied"
        )

    return payload

@app.post("/login")
def login(user: LoginData):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (user.username, user.password)
    )
    result = cursor.fetchone()
    conn.close()
    if result:
        token = create_access_token(
            {
                "username": user.username,
                "role": result[3]
            }
        )

        return {
            "message": "Login Successful",
            "access_token": token
        }

    return {"message": "Invalid Username or Password"}

@app.post("/register")
def register(user: RegisterData):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
        """,
        (user.username, user.password, user.role)
    )

    conn.commit()
    conn.close()

    return {"message": "User Registered Successfully"}


@app.get("/profile")
def profile(token: str = Header()):

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    return {
        "message": "Welcome",
        "user": payload
    }

@app.get("/coach")
def coach_dashboard(token: str = Header()):

    payload = require_role(token, ["Coach"])

    return {
        "message": "Welcome Coach!",
        "user": payload
    }

@app.post("/create-profile")
def create_profile(profile: ProfileData):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO user_profiles
        (name, experience, goals, preferred_topics)
        VALUES (?, ?, ?, ?)
        """,
        (
            profile.name,
            profile.experience,
            profile.goals,
            profile.preferred_topics
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Profile Created Successfully"
    }

@app.put("/update-profile")
def update_profile(profile: ProfileData):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE user_profiles
        SET experience=?,
            goals=?,
            preferred_topics=?
        WHERE name=?
        """,
        (
            profile.experience,
            profile.goals,
            profile.preferred_topics,
            profile.name
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Profile Updated Successfully"
    }
    