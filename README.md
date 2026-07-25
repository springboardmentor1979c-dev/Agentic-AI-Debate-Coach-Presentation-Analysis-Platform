# AI Debate Coach API

This first backend module implements the SRS authentication, role-based access, and user-profile foundation.

## Run

```powershell
.\.venv\Scripts\uvicorn main:app --reload
```

Set `JWT_SECRET_KEY` to a strong random value before deployment. The development fallback is only for local use.

## Main endpoints

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST /register` | Public | Register a user with `Learner`, `Coach`, `Educator`, or `Admin` role |
| `POST /login` | Public | Validate credentials and return a bearer JWT |
| `POST /profile` | Authenticated | Create the logged-in user's profile |
| `GET /profile` | Authenticated | Get the logged-in user's profile |
| `PUT /profile` | Authenticated | Update the logged-in user's profile |
| `GET /dashboard/learner` | Learner | Learner-only example route |
| `GET /dashboard/coach` | Coach | Coach-only example route |
| `GET /dashboard/educator` | Educator | Educator-only example route |
| `GET /admin/users` | Admin | Admin-only user list |

Use `Authorization: Bearer <access_token>` for protected routes. Profile fields are `name`, `experience_level`, `goals`, and `preferred_topics`; the latter two are string arrays.

## Verify

```powershell
.\.venv\Scripts\python.exe test_complete_flow.py
```
