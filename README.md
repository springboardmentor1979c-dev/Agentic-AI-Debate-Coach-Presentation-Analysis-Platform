# Agentic AI Debate Coach – API

A FastAPI backend for the Agentic AI Debate Coach Presentation Analysis Platform. It provides user authentication, role-based access control, and learner profile management.

## Features

- Register and log in users with secure password hashing
- JWT bearer-token authentication
- Four roles: `Learner`, `Coach`, `Educator`, and `Admin`
- Role-protected dashboard and guidance endpoints
- Create and update learner profiles
- SQLite database storage

## Getting started

From the `FastAPI_Project` directory, create and activate a virtual environment:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the dependencies and start the API:

```powershell
pip install fastapi "uvicorn[standard]"
uvicorn main:app --reload
```

Open the interactive API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## Main endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Get a bearer access token |
| `PUT` | `/profile` | Create or update the signed-in user's profile |
| `GET` | `/profile` | Read the signed-in user's profile |
| `GET` | `/learner/dashboard` | Learner-only dashboard |
| `GET` | `/guidance/learners` | Coach and educator guidance |
| `GET` | `/admin/users` | Admin-only user list |

## Authentication

After logging in, click **Authorize** in `/docs` and paste the returned access token as a bearer token. For production, set a strong `JWT_SECRET` environment variable before starting the server.
