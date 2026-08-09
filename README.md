# AI Debate Coach & Presentation Analysis Platform

An end-to-end AI-powered **Agentic Debate Coach & Presentation Intelligence Platform** designed to train and evaluate users in debating, public speaking, argument mining, logical fallacy detection, counterargument generation, and speech analytics.

---

## Key Features & Core Engines

1. **Core User & Access Management**: JWT authentication, OAuth2 Google login simulation, and 4 role-based access personas (**Learner**, **Debate Coach**, **Educator**, **Administrator**).
2. **User Profile & Skill Management**: Skill level tracking, experience level, preferred debate topics, presentation domains, and coaching preferences.
3. **Debate Session Management**: Topic creation, position assignment (Affirmative/Opposition), and 6 supported debate formats (*One-on-One, Parliamentary, Oxford, Policy, Public Forum, AI Debate Simulation*).
4. **Argument Analysis Engine**: Claim extraction, evidence strength scoring, reasoning quality analysis, clarity, relevance, and persuasiveness metrics.
5. **Logical Fallacy Detection Engine**: Detects **8 core fallacies**:
   - *Ad Hominem* (Personal attacks)
   - *Straw Man* (Distorting premises)
   - *False Dilemma* (Binary traps)
   - *Slippery Slope* (Chain reaction assumptions)
   - *Appeal to Authority* (Unvetted authority)
   - *Circular Reasoning* (Begging the question)
   - *Hasty Generalization* (Overbroad claims)
   - *Red Herring* (Topic redirection)
   Generates explanations, fix suggestions, and credibility scores.
6. **Counterargument Generation Engine**: Generates **5 counterargument perspectives**:
   - *Logical*
   - *Evidence-based*
   - *Ethical*
   - *Practical*
   - *Policy*
   Plus challenge questions and debate strategy recommendations.
7. **Presentation Analysis Engine**: Analyzes speech transcripts or live recordings for **words per minute (WPM)** pace, **filler word detection** (*um, uh, like, you know, basically, sort of, I mean, right*), confidence index, clarity score, and audience engagement score.
8. **AI Debate Simulation Engine**: Persona-driven AI debaters (*Socratic Scholar, Aggressive Pragmatist, Policy Expert, Philosophical Analyst*) for multi-turn debate simulation with real-time fallacy warnings and live coaching tips.
9. **Official Performance Scoring Engine**: Exact weighted scoring formula:
   - **Argument Quality**: 30%
   - **Evidence Usage**: 20%
   - **Logical Consistency**: 20%
   - **Rebuttal Effectiveness**: 15%
   - **Communication Skills**: 15%
10. **Recommendation & Coaching Engine**: Skill gap analysis, personalized coaching drills, and learning path progression timelines.
11. **Multi-Role Analytics Dashboards**:
    - *Learner Dashboard*: Debate history, weighted skill breakdown, score trends.
    - *Coach Dashboard*: Student rosters, skill gap analysis, review queue.
    - *Educator Dashboard*: Class performance across formats, class rankings, export features.
    - *Admin Dashboard*: System metrics, API latencies, subsystem health monitors.
12. **Notifications & Export Reports**: PDF official scorecards and Excel/CSV class performance exports.
13. **Docker Containerization**: Multi-container Docker Compose setup for backend & frontend.

---

## Project Structure

```
AI Debate Coach/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints
│   │   ├── core/            # Config, JWT security, DB session
│   │   ├── models/          # ORMs & Pydantic schemas
│   │   ├── services/        # AI engines & ReportLab export service
│   │   └── main.py          # FastAPI application root
│   ├── tests/               # Backend pytest suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, SpeechRecorder
│   │   ├── pages/           # AuthPage, 4 Dashboards, DebateSimulator, ArgumentStudio, PresentationLab, ReportsAndCoaching
│   │   ├── services/        # API client & localStorage state
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── run_app.py
└── README.md
```

---

## Quick Start (Running Locally)

### Option 1: Using the Unified Python Launcher
Run the single launcher script which starts both the FastAPI backend and React frontend:

```bash
python run_app.py
```

- **Frontend Application**: `http://localhost:3000`
- **Backend Swagger API Docs**: `http://localhost:8000/docs`

### Option 2: Running via Docker Compose

```bash
docker-compose up --build
```

---

## Running Backend Unit Tests

```bash
cd backend
pytest tests/test_backend.py
```
