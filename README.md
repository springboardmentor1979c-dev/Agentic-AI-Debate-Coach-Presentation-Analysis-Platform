# ⚡ Agentic AI Debate Coach & Presentation Analysis Platform

> An AI-powered full-stack platform to master debating, critical thinking, and public speaking.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python)](https://www.python.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [AI Engines](#-ai-engines)
- [Roles & Access](#-roles--access)
- [Tech Stack](#-tech-stack)
- [Docker Compose](#-docker-compose)

---

## 🌟 Overview

A complete AI debate coaching platform that provides:

- 🧠 **Argument Analysis** — Score arguments across 5 dimensions
- 🚨 **Fallacy Detection** — Identify 8 types of logical fallacies
- 🔄 **Counterargument Generation** — 5 rebuttal strategies
- 🤖 **AI Debate Simulation** — Multi-turn debate with AI opponent
- 🎤 **Presentation Analytics** — Speech and delivery analysis
- 📊 **Performance Scoring** — Weighted scoring across debate criteria
- 🏫 **Personalized Coaching** — Skill gap recommendations + 4-week learning path
- 📈 **Role-Based Dashboards** — Learner · Coach · Educator · Admin

---

## 🏗️ Architecture

```
debate-coach-platform/
├── Project/                        # FastAPI Backend (Python)
│   ├── main.py                     # App entry point + CORS
│   ├── auth.py                     # JWT + bcrypt auth helpers
│   ├── database.py                 # SQLite CRUD layer
│   ├── models.py                   # Pydantic request/response models
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .gitignore
│   ├── README.md
│   ├── engines/
│   │   ├── argument_engine.py      # 5-criteria argument scoring
│   │   ├── fallacy_engine.py       # 8-type fallacy detection
│   │   ├── counterargument_engine.py  # 5 rebuttal types
│   │   ├── simulation_engine.py    # Multi-turn AI debate
│   │   ├── presentation_engine.py  # Speech analysis
│   │   ├── scoring_engine.py       # Weighted performance scoring
│   │   └── coaching_engine.py      # Recommendations + learning path
│   └── routers/
│       ├── auth_router.py
│       ├── profile_router.py
│       ├── debate_router.py
│       ├── analysis_router.py
│       ├── simulation_router.py
│       ├── scoring_router.py
│       ├── coaching_router.py
│       ├── dashboard_router.py
│       ├── notification_router.py
│       └── report_router.py
├── debate-coach-frontend/          # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx                 # Root + Sidebar routing
│   │   ├── AuthContext.jsx         # Global auth state
│   │   ├── api.js                  # All API calls (centralized)
│   │   ├── index.css               # Premium dark-mode design system
│   │   └── pages/
│   │       ├── AuthPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── DebateSessionsPage.jsx
│   │       ├── AnalysisPage.jsx
│   │       ├── SimulationPage.jsx
│   │       ├── PresentationPage.jsx
│   │       ├── CoachingPage.jsx
│   │       └── ReportsPage.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml              # Full-stack Docker setup
├── .env.example                    # Environment variable template
├── .gitignore
└── README.md                       # (you are here)
```

---

## 🚀 Quick Start

### Option 1: Run Locally (Development)

#### Backend
```bash
cd Project
pip install -r requirements.txt

# Optional: set environment variables
export SECRET_KEY="your-secret-key"
export OPENAI_API_KEY="sk-..."

uvicorn main:app --reload --port 8000
# API Docs: http://localhost:8000/docs
```

#### Frontend
```bash
cd debate-coach-frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

### Option 2: Docker Compose (Recommended)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — set your SECRET_KEY and (optionally) OPENAI_API_KEY

# 2. Build and launch
docker-compose up --build

# App:  http://localhost
# API:  http://localhost:8000/docs
```

---

## 🔑 Environment Variables

| Variable | Required | Description | Default |
|---|---|---|---|
| `SECRET_KEY` | ⚠️ In Prod | JWT signing secret | `dev-secret-change-in-prod` |
| `OPENAI_API_KEY` | No | OpenAI GPT-4o-mini key | empty (uses rule-based fallback) |

> **Note:** All AI engines work **without** an OpenAI key using intelligent rule-based fallbacks.  
> Set `OPENAI_API_KEY` for GPT-4o-mini powered analysis.

> ⚠️ **Never commit your real `.env` file.** Only `.env.example` is safe to push.

---

## 📡 API Endpoints

| Module | Endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| **Profile** | `GET/PUT /profile/me`, `GET /profile/{user_id}` |
| **Debates** | `POST /debates/`, `GET /debates/`, `GET /debates/{id}`, `POST /debates/{id}/arguments` |
| **Analysis** | `POST /analysis/argument`, `/analysis/fallacy`, `/analysis/counterargument`, `/analysis/presentation` |
| **Simulation** | `POST /simulation/start`, `POST /simulation/{id}/respond`, `POST /simulation/{id}/end` |
| **Scoring** | `POST /scoring/debate`, `POST /scoring/presentation`, `GET /scoring/history` |
| **Coaching** | `GET /coaching/recommendations`, `GET /coaching/learning-path`, `GET /coaching/auto` |
| **Dashboard** | `GET /dashboard/learner`, `/dashboard/coach`, `/dashboard/educator`, `/dashboard/admin` |
| **Notifications** | `GET /notifications/`, `PUT /notifications/{id}/read` |
| **Reports** | `GET /reports/my-performance`, `GET /reports/debate/{id}` |

Full interactive docs at: `http://localhost:8000/docs`

---

## 🤖 AI Engines

### Argument Analysis
Scores arguments on **5 criteria** (0–10 each):
- **Clarity** · **Relevance** · **Evidence Strength** · **Logical Consistency** · **Persuasiveness**

### Fallacy Detection
Detects **8 fallacy types** with pattern matching + optional LLM:
- Ad Hominem · Straw Man · False Dilemma · Slippery Slope
- Appeal to Authority · Circular Reasoning · Hasty Generalization · Red Herring

### Counterargument Generator
Produces **5 rebuttal strategies**:
- Logical · Evidence-Based · Ethical · Practical · Policy

### AI Debate Simulation
Multi-turn debate with dynamic AI opponent, **5 formats supported**:
- One-on-One · Parliamentary · Oxford · Policy · Public Forum

### Performance Scoring (Weighted)
```
Debate Score = Argument Quality (30%) + Evidence (20%) + Logic (20%) + Rebuttal (15%) + Communication (15%)
```

### Coaching Engine
- Personalized recommendations per skill gap
- 4-week progressive learning path
- Auto-generated from score history

---

## 🎭 Roles & Access

| Role | Capabilities |
|---|---|
| **Learner** | Debate sessions, analysis, simulation, coaching, own dashboard |
| **Coach** | All learner capabilities + coach dashboard with student oversight |
| **Educator** | Class analytics, student rankings, performance reports |
| **Admin** | Full platform access, user management, system analytics |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Auth** | JWT (python-jose), bcrypt |
| **Database** | SQLite (dev) → PostgreSQL-ready |
| **AI/LLM** | OpenAI GPT-4o-mini (optional) + rule-based fallbacks |
| **Frontend** | React 19, Vite 8 |
| **Styling** | Vanilla CSS (premium dark-mode design system) |
| **Containers** | Docker, Docker Compose, Nginx |

---

## 🐳 Docker Compose

```yaml
services:
  backend:   # FastAPI on port 8000
  frontend:  # React/Nginx on port 80
```

Services communicate via internal Docker network. Only ports `80` and `8000` are exposed.

---

## ✅ Milestones

- ✅ **Milestone 1**: Auth, RBAC, JWT, User Profiles
- ✅ **Milestone 2**: Argument Analysis, Fallacy Detection, Scoring
- ✅ **Milestone 3**: AI Simulation, Coaching, Learning Paths
- ✅ **Milestone 4**: Presentation Analytics, Dashboards, Reports, Docker

---

## 🧪 Running Tests

```bash
cd Project
pytest tests/
```

---

## 📝 License

MIT — Built for educational purposes.
