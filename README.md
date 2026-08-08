# Orator — Agentic AI Debate Coach & Presentation Analysis Platform

> **Version 2.4.0** · Full-stack FastAPI + Vanilla JS platform with 9 AI engines, 4 role-based dashboards, and production deployment.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vanilla JS)                        │
│  index.html (Auth) ←→ dashboard.html (Studio)                  │
│  iPad-style glassmorphism popup panel navigation system         │
├──────────────────────────────────────────────────────────────────┤
│                    FastAPI REST API (main.py)                   │
│  JWT Auth · RBAC · CORS · Request Logging · Health Checks      │
├──────────────────────────────────────────────────────────────────┤
│                    9 AI ENGINE MODULES                          │
│  ArgumentAnalysis │ FallacyDetection │ CounterargumentGen       │
│  PresentationAnalysis │ AIDebateSimulation │ PerformanceScoring │
│  RecommendationCoaching │ DashboardAnalytics │ ReportExport     │
│  NotificationEngagement                                        │
├──────────────────────────────────────────────────────────────────┤
│              SQLite (WAL mode) · 11 tables                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip

### Installation
```bash
cd FastAPI_Project
pip install -r requirements.txt
```

### Run Development Server
```bash
uvicorn main:app --reload --port 8000
```

### Access
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Frontend**: Open `frontend/index.html` with Live Server (port 5500)

---

## 🐳 Docker Deployment

### Build & Run
```bash
docker build -t orator-debate-coach .
docker run -p 8000:8000 -e JWT_SECRET=your-secret-key orator-debate-coach
```

### Docker Compose
```bash
docker-compose up -d
```

---

## 📁 Project Structure

```
FastAPI_Project/
├── main.py                      # FastAPI app, routes, middleware, JWT auth
├── database.py                  # SQLite schema (11 tables), WAL mode
├── argument_engine.py           # Module 4+5: Argument & Fallacy Detection
├── counterargument_engine.py    # Module 6: Counterargument Generation
├── presentation_engine.py       # Module 7: Presentation Analysis
├── simulation_engine.py         # Module 8: AI Debate Simulation
├── scoring_engine.py            # Module 9: Performance Scoring (30/20/20/15/15)
├── coaching_engine.py           # Module 10: Recommendation & Coaching
├── analytics_engine.py          # Module 11: Dashboard & Analytics
├── notification_system.py       # Module 12: Notification & Engagement
├── report_exporter.py           # Module 13: Reports & Export (PDF/Excel)
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Production container
├── docker-compose.yml           # Orchestration
├── .env.example                 # Environment template
├── .dockerignore                # Build exclusions
├── test_*.py                    # 11 test suites
└── frontend/
    ├── index.html               # Auth pages (Login/Register)
    ├── app.js                   # Auth logic
    ├── styles.css               # Design system
    ├── dashboard.html           # Main studio dashboard
    ├── dashboard.js             # All panel logic + analytics
    └── assets/                  # Static assets
```

---

## 🔑 Authentication & Roles

| Role | Access Level |
|------|-------------|
| **Learner** | Personal practice, all engines, own analytics |
| **Coach** | Learner access + student progress monitoring, skill gap analysis |
| **Educator** | Coach access + class analytics, student rankings, reports |
| **Admin** | Full access + user management, platform analytics, AI model monitoring |

### Auth Flow
1. `POST /auth/register` — Create account with role
2. `POST /auth/login` — Get JWT token (60-min expiry)
3. Use `Authorization: Bearer <token>` header for all requests

---

## 🧠 AI Engine Modules

### Module 4+5: Argument Analysis & Fallacy Detection
- 5-criteria scoring: Clarity, Relevance, Evidence, Logic, Persuasiveness
- 8 fallacies detected: Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring

### Module 6: Counterargument Generation
- 5 types: Logical, Evidence-Based, Ethical, Practical, Policy
- Rebuttals, counterpoints, challenge questions, debate strategies

### Module 7: Presentation Analysis
- Speech pace (WPM), 17+ filler word patterns, confidence scoring, clarity analysis, engagement metrics

### Module 8: AI Debate Simulation
- 5 AI personas: Socratic Scholar, Hard-hitting Debater, Policy Expert, Moralist, Pragmatist
- Multi-turn arena, real-time challenges, Coach's Corner

### Module 9: Performance Scoring
- **Debate Score** = AQ(30%) + EU(20%) + LC(20%) + RE(15%) + CS(15%)
- Tiers: Master Orator (90+), Proficient Speaker (75-89), Developing Communicator (60-74), Novice Practice (<60)

### Module 10: Recommendation & Coaching
- Personalized recommendations, 4-milestone development plans, 4-week learning paths

### Module 11: Dashboard & Analytics
- Role-specific analytics: Learner trends, Coach skill gaps, Educator leaderboards, Admin platform health

### Module 12: Notifications
- Debate reminders, coaching alerts, practice reminders, skill milestones, announcements

### Module 13: Reports & Export
- JSON / Excel (CSV) / PDF export for all report types

---

## 🔌 API Endpoints Summary

| Category | Endpoint | Method |
|----------|----------|--------|
| **System** | `/health` | GET |
| **System** | `/system/status` | GET |
| **Auth** | `/auth/register` | POST |
| **Auth** | `/auth/login` | POST |
| **Profile** | `/profile` | GET/POST |
| **Skills** | `/skills` | GET/PUT |
| **Goals** | `/goals` | GET/POST |
| **Sessions** | `/sessions` | GET/POST |
| **Argument** | `/argument/analyze` | POST |
| **Counter** | `/counter/generate` | POST |
| **Presentation** | `/presentation/analyze` | POST |
| **Simulation** | `/simulation/start` | POST |
| **Scoring** | `/scoring/evaluate` | POST |
| **Coaching** | `/coaching/generate` | POST |
| **Analytics** | `/analytics/learner` | GET |
| **Analytics** | `/analytics/coach` | GET |
| **Analytics** | `/analytics/educator` | GET |
| **Analytics** | `/analytics/admin` | GET |
| **Reports** | `/reports/debate/{id}` | GET |
| **Reports** | `/reports/presentation/{id}` | GET |
| **Reports** | `/reports/performance/{id}` | GET |
| **Reports** | `/reports/coaching/{id}` | GET |
| **Reports** | `/reports/learning-progress` | GET |
| **Notifications** | `/notifications` | GET |

---

## 🧪 Testing

### Run All Tests
```bash
python test_argument_engine.py
python test_counterargument_engine.py
python test_presentation_engine.py
python test_simulation_engine.py
python test_scoring_engine.py
python test_coaching_engine.py
python test_analytics_engine.py
python test_report_exporter.py
python test_notification_system.py
python test_e2e_integration.py
```

### E2E Integration Test
The `test_e2e_integration.py` covers the complete workflow:
```
Register → Argument Analysis → Counter Generation → Presentation Analysis →
AI Debate Simulation → Performance Scoring → Coaching Plan →
Dashboard Analytics → Report Export → Notifications
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `change-this-...` | JWT signing secret (MUST change in production) |
| `HOST` | `0.0.0.0` | Server bind host |
| `PORT` | `8000` | Server port |
| `LOG_LEVEL` | `info` | Logging level |

---

## 📊 Database Schema (11 Tables)

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles & password hashes |
| `user_profiles` | Speaker profiles, experience, goals, topics |
| `argument_analyses` | Stored argument analysis reports |
| `counterargument_reports` | Stored counterargument generations |
| `presentation_analyses` | Stored presentation analysis results |
| `debate_simulation_sessions` | AI debate simulation session state |
| `debate_simulation_turns` | Individual simulation turn history |
| `performance_scorecards` | Weighted performance scorecards |
| `coaching_plans` | Generated coaching & learning plans |
| `notifications` | User notifications & alerts |
| `debate_history` | Logged debate rounds |

---

## 📄 License

See [LICENSE](LICENSE) for details.
