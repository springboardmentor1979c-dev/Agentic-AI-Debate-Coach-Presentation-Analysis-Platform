# Agentic AI Debate Coach & Presentation Analysis Platform

An AI-powered platform that helps you get better at debating, critical thinking, and public speaking. It analyzes your arguments, catches logical fallacies, generates counterarguments, and even debates you back using AI.

---

## What it does

- **Argument Analysis** — Scores your argument on clarity, evidence, logic, and persuasiveness
- **Fallacy Detection** — Spots 8 types of logical fallacies in your text
- **Counterargument Generator** — Gives you 5 different ways to counter an argument
- **AI Debate Simulation** — An AI opponent that debates you in real time
- **Presentation Analysis** — Reviews your speech transcript for pace, filler words, and clarity
- **Performance Scoring** — Tracks your progress with a weighted scoring model
- **Coaching & Learning Path** — Personalized tips and a 4-week improvement plan
- **Role-based Dashboards** — Different views for Learners, Coaches, Educators, and Admins

---

## Tech Stack

- **Backend** — Python, FastAPI, SQLite
- **Frontend** — React 19, Vite
- **Auth** — JWT + bcrypt
- **AI** — OpenAI GPT-4o-mini (optional, falls back to rule-based logic)
- **Deploy** — Docker + Docker Compose + Nginx

---

## Getting Started

### Backend
```bash
cd Project
pip install -r requirements.txt
uvicorn main:app --reload
# API docs at http://localhost:8000/docs
```

### Frontend
```bash
cd debate-coach-frontend
npm install
npm run dev
# App at http://localhost:5173
```

### Or just use Docker
```bash
cp .env.example .env
# Add your SECRET_KEY and optionally OPENAI_API_KEY
docker-compose up --build
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | Yes (in prod) | JWT secret key |
| `OPENAI_API_KEY` | No | Enables GPT-4o-mini. Works without it too. |

---

## Roles

| Role | What they can do |
|---|---|
| Learner | Debate, analyze, get coached |
| Coach | Everything + student overview |
| Educator | Class analytics and rankings |
| Admin | Full platform access |

---

## License

MIT
