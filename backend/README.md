# debate-coach-presentation-analysis

FastAPI REST API with JWT authentication, SQLite persistence, and role-based access control (Learner / Coach / Educator / Admin).

## Setup

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | — | Create account |
| `POST` | `/auth/login` | — | Get JWT token (OAuth2 form) |
| `GET` | `/auth/me` | Bearer | Current user |
| `GET` | `/profile/me` | Bearer | Own profile |
| `PUT` | `/profile/me` | Bearer | Create / update own profile |
| `GET` | `/profile/{user_id}` | admin, educator | View any user's profile |
| `GET` | `/docs` | — | Swagger UI |

## Tests

```bash
pytest
```
