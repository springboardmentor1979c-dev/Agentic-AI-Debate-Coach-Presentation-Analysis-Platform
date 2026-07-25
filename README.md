# AI Debate Coach & Presentation Analysis Platform

## 📌 Overview

This project is a FastAPI-based backend developed as part of the Infosys Springboard Internship. It provides secure user authentication using JWT, role-based access control (RBAC), and user profile management for an AI Debate Coach & Presentation Analysis Platform.

---

## 🚀 Features

- User Registration
- User Login with JWT Authentication
- Password Hashing using Bcrypt
- Role-Based Access Control (Learner, Coach, Educator, Admin)
- User Profile Creation
- User Profile Update
- Debate Session Access API
- Coach Feedback API
- Educator Content Management API
- Admin User Management API
- SQLite Database Integration

---

## 🛠️ Tech Stack

- FastAPI
- Python
- SQLAlchemy
- SQLite
- JWT Authentication (python-jose)
- Passlib (bcrypt)
- Uvicorn

---

## 📂 Project Structure

```text
.
├── main.py
├── auth.py
├── database.py
├── models.py
├── schemas.py
├── requirements.txt
├── users.db
└── README.md
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
cd <repository-folder>
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## ▶️ Run the Application

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload
```

The application will be available at:

```
http://127.0.0.1:8000
```

Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## 🔐 User Roles

- Learner
- Coach
- Educator
- Admin

Each role has different access permissions implemented using JWT-based authentication and Role-Based Access Control (RBAC).

---

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home |
| POST | `/register` | Register a new user |
| POST | `/login` | User login |
| POST | `/profile` | Create user profile (Admin) |
| PUT | `/profile/{profile_id}` | Update profile (Admin) |
| GET | `/debates` | View debate sessions |
| GET | `/coach/feedback` | Coach feedback |
| GET | `/educator/content` | Educator content management |
| GET | `/admin/users` | View all registered users (Admin) |

---

## 📖 Authentication

Protected endpoints require a valid JWT Bearer Token.

Use the **Authorize** button available in the Swagger UI after logging in.

---

## 👨‍💻 Developed For

Infosys Springboard Internship

AI Debate Coach & Presentation Analysis Platform