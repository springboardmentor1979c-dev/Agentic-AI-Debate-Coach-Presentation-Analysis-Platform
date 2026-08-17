# 🧠 DebateIQ AI

### AI-Powered Debate Coaching Platform

DebateIQ AI is a full-stack AI-powered debate coaching platform that helps learners practice and improve their debating skills through real-time AI interaction. The platform allows learners to choose a debate topic and stance (**For/Against**), present arguments, receive intelligent AI counterarguments, evaluate their performance, and get personalized suggestions, supporting points, and evidence to strengthen their arguments.

---

## ✨ Features

### 🎤 AI Debate Practice

* Real-time AI-powered debate conversations.
* Learner can choose **For** or **Against** stance.
* AI automatically takes the opposing stance.
* Learners can submit arguments through an interactive debate room.

### 🤖 AI Debate Coach

The AI acts as both:

* **Opponent** — challenges the learner with logical counterarguments.
* **Coach** — helps the learner improve their chosen position.

For every argument, the AI provides:

* 📊 Argument evaluation
* ⭐ Overall score
* ✅ Strong points
* ⚠️ Areas for improvement
* 💡 Additional supporting arguments
* 📚 Supporting evidence and examples
* 🛡 Improved version of the learner's argument
* 🤖 Opponent's rebuttal
* 🎯 Strategies to defend against the rebuttal
* ⭐ Personalized coaching tips

### 🔐 Authentication

* User registration and login.
* JWT-based authentication.
* Password hashing.
* Protected API endpoints.
* User profile and role management.

### 📊 Learner Dashboard

* Personalized learner dashboard.
* Debate-related navigation.
* AI Debate Coach access.
* User authentication state management.

### 🗄️ Database

* PostgreSQL database.
* SQLAlchemy ORM.
* Debate session and message models.
* User data persistence.

---

## 🛠️ Tech Stack

### Frontend

* **React.js**
* **Vite**
* **Tailwind CSS**
* **React Router DOM**
* **Axios**
* **React Icons**

### Backend

* **Python**
* **FastAPI**
* **Google Gemini API**
* **SQLAlchemy**
* **Pydantic**
* **JWT Authentication**
* **Password Hashing**

### Database

* **PostgreSQL**
* **pgAdmin**

### AI

* **Google Gemini**
* **Google AI Studio**
* Prompt Engineering
* Generative AI-based debate evaluation and coaching

### Development Tools

* VS Code
* Git
* GitHub
* Swagger UI / FastAPI Docs
* Vite Development Server

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Learner         │
                    │  Topic + Stance      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │  DebateIQ AI UI       │
                    └──────────┬───────────┘
                               │
                         Axios / HTTP
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │                      │
                    │ Authentication       │
                    │ Debate APIs          │
                    │ AI APIs              │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────┘       └──────────┐
                 ▼                             ▼
       ┌──────────────────┐          ┌──────────────────┐
       │   PostgreSQL     │          │   Google Gemini  │
       │                  │          │       AI         │
       │ Users            │          │                  │
       │ Debates          │          │ Rebuttals        │
       │ Messages         │          │ Evaluation       │
       └──────────────────┘          │ Suggestions      │
                                     └──────────────────┘
```

---

## 📂 Project Structure

```text
debateiq-ai/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── ai.py
│   │   │   └── debate.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── debate.py
│   │   │   └── message.py
│   │   │
│   │   ├── schemas/
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   └── gemini_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── learner/
│   │   │   │   ├── AIDebateCoach.jsx
│   │   │   │   ├── DebateRoom.jsx
│   │   │   │   └── NewDebate.jsx
│   │   │   │
│   │   │   └── Login.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

> The exact structure may vary depending on additional files in your repository.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/debateiq-ai.git

cd debateiq-ai
```

---

# 🔹 Backend Setup

### 2. Navigate to Backend

```bash
cd backend
```

### 3. Create Virtual Environment

```bash
python -m venv .venv
```

### 4. Activate Virtual Environment

#### Windows

```bash
.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` directory.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/debateiq

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=your_gemini_api_key
```

### Important

Never commit your `.env` file to GitHub.

Add this to `.gitignore`:

```text
.env
.venv/
__pycache__/
```

---

## 🗄️ PostgreSQL Setup

Create a PostgreSQL database using pgAdmin or PostgreSQL CLI.

Example:

```text
Database Name:
debateiq
```

Then update:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/debateiq
```

---

# 🚀 Run the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 🔹 Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:3000
```

---

## 🔄 AI Debate Flow

```text
1. Learner logs in
        ↓
2. Learner selects a debate topic
        ↓
3. Learner selects FOR / AGAINST
        ↓
4. AI takes the opposite position
        ↓
5. Learner presents an argument
        ↓
6. Gemini analyzes the argument
        ↓
7. AI evaluates the argument
        ↓
8. AI provides supporting points
        ↓
9. AI provides evidence and examples
        ↓
10. AI generates an opponent rebuttal
        ↓
11. AI teaches the learner how to defend
        ↓
12. AI provides a personalized coaching tip
```

---

## 🧠 Example

### Topic

```text
Artificial Intelligence should replace teachers.
```

### Learner Stance

```text
FOR
```

### Learner Argument

```text
AI can personalize education better than traditional classrooms.
```

### DebateIQ AI provides

```text
📊 Argument Evaluation

Overall Score: 84/100

Logic: 8/10
Evidence: 6/10
Clarity: 9/10
Persuasiveness: 8/10

✅ Strong Points
...

⚠ Areas to Improve
...

💡 Additional Supporting Points
...

📚 Supporting Evidence
...

🛡 Improved Version
...

🤖 Opponent's Rebuttal
...

🎯 How to Defend Against That Rebuttal
...

⭐ Final Coaching Tip
...
```

---

## 🔐 Authentication Flow

```text
User
 │
 │ Email + Password
 ▼
FastAPI /auth/login
 │
 ▼
Verify Password
 │
 ▼
Generate JWT
 │
 ▼
React stores token
 │
 ▼
Protected API Requests
 │
 ▼
Authenticated User
```

---

## 🎯 Project Objectives

* Improve learners' debating skills.
* Develop critical thinking and logical reasoning.
* Provide personalized AI-based feedback.
* Help learners construct stronger arguments.
* Improve evidence-based reasoning.
* Practice rebuttal and counterargument techniques.
* Provide a realistic AI-powered debate environment.

---

## 🔮 Future Enhancements

* 🎙️ Voice-based debates
* 🗣️ Speech recognition
* 📈 Debate performance analytics
* 📊 Progress tracking
* 📝 AI-generated debate reports
* 📄 PDF report generation
* 🏆 Leaderboards
* 📚 Debate history
* 🔎 Fact checking
* 🎯 Advanced fallacy detection
* 🌐 Multi-language debate support
* 🎤 Speech pacing and tone analysis

---

## 🔒 Security

* Passwords are hashed before storage.
* JWT tokens are used for authentication.
* Protected endpoints require authentication.
* Environment variables are used for secrets.
* API keys are not stored directly in source code.

---

## 👩‍💻 Developer

**Shaik Yasmin**

B.Tech – Computer Science & Engineering

---

## ⭐ Why DebateIQ AI?

Traditional debate practice requires another person to act as an opponent and provide feedback. DebateIQ AI provides an interactive alternative where learners can practice arguments anytime and receive immediate, structured, AI-powered coaching.

> **Practice your argument. Challenge your thinking. Become a better debater.**

---

## 📜 License

This project is developed for educational and academic purposes.
