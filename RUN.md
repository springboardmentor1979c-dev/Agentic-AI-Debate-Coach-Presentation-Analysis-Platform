# 🚀 How to Run the Debate Coach Platform

This is a full-stack application with a **FastAPI backend** (Python) and a **Vite + React frontend** (TypeScript).

---

## 📦 Prerequisites

- **Python 3.10+** installed
- **Node.js 18+** installed
- **npm** (comes with Node.js)

---

## 🖥️ Running the Project

### Step 1: Start the Backend (FastAPI)

```bash
cd debate_coach_api

# Create a virtual environment (first time only)
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: **http://localhost:8000**
- Interactive API docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

### Step 2: Start the Frontend (Vite + React)

Open a **new terminal** and run:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

---

## 🔑 Demo Credentials

The database comes pre-seeded with test users:

| Name           | Email              | Password      | Role      |
|----------------|--------------------|---------------|-----------|
| Alice Learner  | learner@demo.com   | password123   | Learner   |
| Bob Coach      | coach@demo.com     | password123   | Coach     |
| Carol Educator | educator@demo.com  | password123   | Educator  |
| Dave Admin     | admin@demo.com     | password123   | Admin     |

You can also register new users from the login page.

---

## 🐳 Docker (Alternative - Backend Only)

If you have Docker installed, you can run the backend with all its services:

```bash
cd debate_coach_api
docker-compose up -d
```

This starts: API (port 8000), Redis, Kafka, Prometheus (port 9090), Grafana (port 3001).

> Note: The frontend still needs to be run separately with `npm run dev`.

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file in `debate_coach_api/` to override defaults:

| Variable              | Default                        | Description                                        |
|-----------------------|--------------------------------|----------------------------------------------------|
| `SECRET_KEY`          | (built-in dev key)             | JWT signing key                                    |
| `LLM_PROVIDER`        | `mock`                         | AI provider: `mock` (no key needed), `openai`, `anthropic` |
| `OPENAI_API_KEY`      | (empty)                        | OpenAI API key (only if using real GPT analysis)   |
| `ANTHROPIC_API_KEY`   | (empty)                        | Anthropic API key (only if using real Claude)      |
| `APP_ENV`             | `development`                  | Environment: development/production                |
| `CORS_ORIGINS`        | http://localhost:3000           | Allowed CORS origins                               |

### 💡 No API Keys Required!

The platform works **fully out of the box** with zero API keys. All AI features use **mock mode** by default (`LLM_PROVIDER=mock`), which returns realistic simulated responses for:
- 🎯 AI Debate Simulation (practice against an AI opponent)
- 📝 Argument Analysis & Fallacy Detection
- 📊 Presentation Coaching & Feedback
- 🧠 Personalized Coaching Plans & Recommendations

> **To enable real AI features**, set `LLM_PROVIDER=openai` and add your `OPENAI_API_KEY` to the `.env` file. This is completely optional — everything works in mock mode for development and testing.

---

## 📁 Project Structure

```
key stock/
├── debate_coach_api/      # Python FastAPI backend
│   ├── main.py            # Entry point + seed data
│   ├── config.py          # Configuration
│   ├── database.py        # Database setup
│   ├── models/            # SQLAlchemy models
│   ├── routers/           # API route handlers
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic (LLM, vector store, etc.)
│   ├── utils/             # Utilities (auth, etc.)
│   ├── monitoring/        # Prometheus config
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Docker image
│   └── docker-compose.yml # Container orchestration
│
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx        # Main app + routing
│   │   ├── api/           # API client (axios)
│   │   ├── components/    # Shared components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   ├── package.json       # Node dependencies
│   └── vite.config.ts     # Vite config with proxy
│
└── RUN.md                 # This file
```

---

## 🧪 Testing the API

Once the backend is running, test it with:

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "learner@demo.com", "password": "password123"}'
```

