# Agentic AI Debate Coach & Presentation Analysis Platform

An advanced, full-stack SaaS application designed to provide real-time, autonomous coaching for competitive debaters and public speakers. The platform utilizes custom Python algorithms to analyze arguments across a 4-point logical framework while performing real-time speech analytics via Web Audio APIs.

## 🚀 Key Features

*   **Real-Time Audio Analytics:** Custom Canvas/Web Audio API integration provides a highly responsive "AI Orb" visualizer that reacts to the speaker's volume and cadence.
*   **Live Speech Transcription:** Seamless Web Speech API integration transcribes spoken arguments in real-time, feeding directly into the AI evaluation engine.
*   **4-Point Logical Framework:** The backend engine strictly evaluates arguments based on:
    *   **Claim:** The core thesis.
    *   **Evidence:** The supporting data.
    *   **Rebuttal:** Acknowledging counter-arguments.
    *   **Verdict:** The concluding impact.
*   **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities for Learners, Coaches, Educators, and Admins.
*   **Classroom Assignment Engine:** Educators can seamlessly push debate topics directly to Learner dashboards.
*   **Interactive Resource Library:** Multi-page, interactive educational modules covering the Toulmin Model, Karl Popper format, and Logical Fallacies (Straw Man, Ad Hominem).

## 🛠️ Technology Stack

**Frontend:**
*   Next.js (React)
*   Tailwind CSS (Custom Glassmorphism & Animations)
*   Web Audio API & HTML5 Canvas

**Backend:**
*   FastAPI (Python)
*   SQLite / PostgreSQL
*   JWT Authentication (python-jose, passlib)
*   Uvicorn

## 📂 Project Structure

```
agentic_debate_coach/
│
├── app/                      # FastAPI Backend
│   ├── main.py               # Application entry point & routes
│   ├── models.py             # SQLAlchemy Database Models
│   ├── schemas.py            # Pydantic validation schemas
│   ├── auth.py               # JWT generation and hashing
│   └── presentation_service.py # Core AI Scoring Logic & Audio processing
│
├── frontend_next/            # Next.js Frontend App
│   └── frontend_next/
│       ├── src/app/          # Next.js App Router (page.tsx, layout.tsx, globals.css)
│       ├── tailwind.config.ts
│       └── package.json
│
└── requirements.txt          # Python dependencies
```

## ⚙️ Local Setup Instructions

### 1. Backend Setup (FastAPI)
1. Navigate to the root directory: `cd agentic_debate_coach`
2. Create a virtual environment (optional but recommended): `python -m venv venv`
3. Activate the environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn app.main:app --reload`
   * The backend will run on `http://127.0.0.1:8000`

### 2. Frontend Setup (Next.js)
1. Open a new terminal instance.
2. Navigate to the Next.js directory: `cd agentic_debate_coach/frontend_next/frontend_next`
3. Install Node modules: `npm install`
4. Start the development server: `npm run dev`
5. Open your browser to `http://localhost:3000` (or the port specified in the terminal).

## 🔒 Default Roles & Login

You can create a new account or utilize existing ones. The RBAC system is fully functional:
*   **Educators** can assign topics.
*   **Learners** can complete active assignments.
*   **Coaches** can view student analytics.

## 🔮 Future Enhancements
*   Integration with OpenAI Whisper for production-grade, offline-capable transcription.
*   PostgreSQL migration for persistent, scalable state management.
*   PDF Export generation for historical tracking across semesters.
