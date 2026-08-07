# 🧠 Debate Coach — FastAPI Backend

AI-powered REST API for debate coaching, argument analysis, fallacy detection, AI debate simulation, and performance scoring. Supports 4 roles: **Learner · Coach · Educator · Admin**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. (Optional) Set environment variables
export SECRET_KEY="your-secret-key"
export OPENAI_API_KEY="sk-..."  # optional — enables GPT-4o-mini analysis

# 3. Run
uvicorn main:app --reload --port 8000

# 4. Open API docs
# http://localhost:8000/docs
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | No | JWT signing secret. Defaults to a dev placeholder. **Change in production.** |
| `OPENAI_API_KEY` | No | Enables GPT-4o-mini powered AI engines. Falls back to rule-based logic if not set. |

> ⚠️ **Never commit a real `.env` file.** Copy `.env.example` and fill in your values.

---

## 📡 API Endpoints

| Module | Method | Route | Auth | Description |
|---|---|---|---|---|
| **Auth** | POST | `/auth/register` | — | Create account |
| | POST | `/auth/login` | — | Get JWT token |
| | GET | `/auth/me` | Bearer | Current user info |
| **Profile** | GET | `/profile/me` | Bearer | Own profile |
| | PUT | `/profile/me` | Bearer | Create / update profile |
| | GET | `/profile/{user_id}` | admin/educator | View any user's profile |
| **Debates** | POST | `/debates/` | Bearer | Create a debate session |
| | GET | `/debates/` | Bearer | List own debates |
| | GET | `/debates/{id}` | Bearer | Get debate details |
| | POST | `/debates/{id}/arguments` | Bearer | Submit argument |
| **Analysis** | POST | `/analysis/argument` | Bearer | Score an argument |
| | POST | `/analysis/fallacy` | Bearer | Detect logical fallacies |
| | POST | `/analysis/counterargument` | Bearer | Generate counterarguments |
| | POST | `/analysis/presentation` | Bearer | Analyze presentation |
| **Simulation** | POST | `/simulation/start` | Bearer | Start AI debate |
| | POST | `/simulation/{id}/respond` | Bearer | Send response |
| | POST | `/simulation/{id}/end` | Bearer | End debate |
| **Scoring** | POST | `/scoring/debate` | Bearer | Score a debate |
| | POST | `/scoring/presentation` | Bearer | Score a presentation |
| | GET | `/scoring/history` | Bearer | Scoring history |
| **Coaching** | GET | `/coaching/recommendations` | Bearer | Get recommendations |
| | GET | `/coaching/learning-path` | Bearer | 4-week learning path |
| | GET | `/coaching/auto` | Bearer | Auto-generate coaching |
| **Dashboard** | GET | `/dashboard/learner` | learner | Learner dashboard |
| | GET | `/dashboard/coach` | coach | Coach dashboard |
| | GET | `/dashboard/educator` | educator | Educator dashboard |
| | GET | `/dashboard/admin` | admin | Admin dashboard |
| **Notifications** | GET | `/notifications/` | Bearer | Get notifications |
| | PUT | `/notifications/{id}/read` | Bearer | Mark as read |
| **Reports** | GET | `/reports/my-performance` | Bearer | Personal report |
| | GET | `/reports/debate/{id}` | Bearer | Debate-specific report |

---

## 🧱 Project Structure

```
Project/
├── main.py                  # FastAPI app entry point + CORS
├── auth.py                  # JWT helpers, bcrypt, role guards
├── database.py              # SQLite CRUD layer
├── models.py                # Pydantic request/response models
├── requirements.txt
├── Dockerfile
├── engines/
│   ├── argument_engine.py       # 5-criteria argument scoring
│   ├── fallacy_engine.py        # 8-type fallacy detection
│   ├── counterargument_engine.py # 5 rebuttal strategies
│   ├── simulation_engine.py     # Multi-turn AI opponent
│   ├── presentation_engine.py   # Speech analysis
│   ├── scoring_engine.py        # Weighted performance scoring
│   └── coaching_engine.py       # Recommendations + learning path
└── routers/
    ├── auth_router.py
    ├── profile_router.py
    ├── debate_router.py
    ├── analysis_router.py
    ├── simulation_router.py
    ├── scoring_router.py
    ├── coaching_router.py
    ├── dashboard_router.py
    ├── notification_router.py
    └── report_router.py
```

---

## 🤖 AI Engines

### Argument Analysis Engine
Scores arguments on 5 criteria (0–10 each):
- Clarity · Relevance · Evidence Strength · Logical Consistency · Persuasiveness

### Fallacy Detection Engine
Detects 8 logical fallacy types:
- Ad Hominem · Straw Man · False Dilemma · Slippery Slope
- Appeal to Authority · Circular Reasoning · Hasty Generalization · Red Herring

### Counterargument Generator
Generates 5 rebuttal strategies:
- Logical · Evidence-Based · Ethical · Practical · Policy

### AI Debate Simulation
Multi-turn AI opponent supporting 5 formats:
- One-on-One · Parliamentary · Oxford · Policy · Public Forum

### Performance Scoring (Weighted)
```
Debate Score = Argument Quality (30%) + Evidence (20%) + Logic (20%) + Rebuttal (15%) + Communication (15%)
```

### Coaching Engine
- Personalized recommendations per skill gap
- 4-week progressive learning path
- Auto-generates from score history

---

## 🎭 Roles & Access Control

| Role | Capabilities |
|---|---|
| **Learner** | Debate sessions, analysis, simulation, coaching, own dashboard |
| **Coach** | All learner capabilities + coach dashboard with student oversight |
| **Educator** | Class analytics, student rankings, performance reports |
| **Admin** | Full platform access, user management, system analytics |

---

## 🧪 Running Tests

```bash
pytest tests/
```

---

## 🐳 Docker

```bash
docker build -t debate-coach-backend .
docker run -p 8000:8000 \
  -e SECRET_KEY="your-secret" \
  -e OPENAI_API_KEY="sk-..." \
  debate-coach-backend
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Python 3.12, FastAPI, Uvicorn |
| **Auth** | JWT (python-jose), bcrypt |
| **Database** | SQLite (dev) → PostgreSQL-ready |
| **AI/LLM** | OpenAI GPT-4o-mini + rule-based fallbacks |
| **Validation** | Pydantic v2 |

---

## 📝 License

MIT — Built for educational purposes.
