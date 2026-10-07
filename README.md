<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=260&color=0:134E5E,50:2ECC71,100:A8E063&text=Agentic%20AI%20Debate%20Coach&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=38"/>
</p>

<div align="center">

# 🎤 Agentic AI Debate Coach & Presentation Analysis Platform

### AI-powered platform for debate training, argument intelligence, public speaking analysis, and personalized communication coaching.

<p>

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_AI-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

</p>

**Transform every debate, presentation, and speech into measurable improvement using Agentic AI.**

</div>

---

# 🚀 Overview

The **Agentic AI Debate Coach** is an intelligent communication platform designed to help users develop stronger arguments, improve public speaking skills, practice structured debates, and receive actionable AI-driven coaching.

Rather than simply evaluating a speech, the platform functions as an **interactive AI mentor** that understands reasoning, identifies logical weaknesses, simulates debate opponents, analyzes delivery, and provides personalized improvement strategies.

Whether preparing for competitive debates, interviews, presentations, or classroom discussions, users receive comprehensive feedback covering both **content quality** and **presentation effectiveness**.

---

# ✨ Core Features

## 🧠 AI Argument Intelligence

- Automatic claim extraction
- Premise identification
- Supporting evidence detection
- Logical consistency evaluation
- Argument structure visualization
- AI-powered argument rewriting
- Persuasiveness scoring
- Clarity and relevance analysis

---

## ⚖️ Logical Fallacy Detection

Automatically identifies reasoning flaws including:

- Strawman
- Ad Hominem
- Slippery Slope
- False Cause
- Circular Reasoning
- False Dilemma
- Appeal to Emotion
- Hasty Generalization
- Red Herring
- Bandwagon

Each detected fallacy includes explanations and suggested corrections.

---

## 🎭 Interactive Debate Arena

Practice against an intelligent AI opponent capable of generating realistic counterarguments.

Features include:

- Multiple debate formats
- Adjustable difficulty levels
- Multi-round debates
- Dynamic AI responses
- Rebuttal evaluation
- Live coaching suggestions
- End-of-session performance reports

---

## 🎙️ Presentation Analytics

Upload presentation recordings for comprehensive communication analysis.

Includes:

- Words Per Minute (WPM)
- Speaking pace analysis
- Pause distribution
- Filler word detection
- Eye contact estimation
- Posture tracking
- Confidence indicators
- Vocal delivery metrics
- Exportable performance reports

---

## 📊 Performance Dashboard

Track long-term growth with personalized analytics.

- Debate history
- Communication score trends
- Argument quality progression
- Presentation improvements
- Personalized recommendations
- Learning insights

---

# 🏗 Architecture

```
                    +----------------------+
                    |   React Frontend     |
                    +----------+-----------+
                               |
                        REST API / JWT
                               |
                    +----------v-----------+
                    |      FastAPI         |
                    +----------+-----------+
                               |
             +-----------------+------------------+
             |                                    |
     AI Workflow Engine                  Database Layer
      (LangGraph)                      (SQLAlchemy ORM)
             |                                    |
   +---------+---------+                 PostgreSQL / SQLite
   |                   |
Argument Analysis   Presentation AI
Debate Simulation   Report Generation
```

---

# ⚡ Technology Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- SQLite (Development)
- JWT Authentication
- Bcrypt
- ReportLab

---

## AI Stack

- LangChain
- LangGraph
- LLM Prompt Engineering
- Rule-based Fallacy Detection
- Agentic Workflow Orchestration

---

## Frontend

- React 19
- Vite
- Tailwind CSS v4
- Framer Motion
- Lucide Icons

---

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Nginx

---

# 📁 Project Structure

```text
debate-coach/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── ai/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
```

---

# 🚀 Quick Start

## Clone Repository

```bash
git clone https://github.com/yourusername/debate-coach.git

cd debate-coach
```

---

## Docker Deployment

```bash
docker compose up --build
```

Application URLs

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# 💻 Local Development

## Backend

```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r backend/requirements.txt

python backend/app/main.py
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔌 API Modules

## Authentication

- Register
- Login
- JWT Token
- User Profiles

---

## Debate Engine

- Start Debate
- Submit Arguments
- AI Counter Arguments
- Coaching Feedback
- Debate Summary

---

## Argument Analysis

- Claims Extraction
- Premise Detection
- Evidence Analysis
- Fallacy Detection
- AI Rewrite Suggestions

---

## Presentation Analysis

- Upload Media
- Speech Analysis
- Pose Estimation
- Voice Metrics
- Report Generation

---

# 📈 Example Workflow

```
Create Account
        │
        ▼
Create Debate Session
        │
        ▼
Submit Argument
        │
        ▼
AI Analysis
        │
        ▼
Receive Coaching
        │
        ▼
Practice Debate
        │
        ▼
Presentation Upload
        │
        ▼
Detailed Performance Report
```

---

# 📊 Reports

The platform can generate comprehensive reports containing:

- Debate Scores
- Argument Breakdown
- Fallacy Analysis
- Presentation Metrics
- Coaching Feedback
- Learning Recommendations

Reports are exportable as:

- PDF
- JSON
- CSV

---

# 🔒 Security

- JWT Authentication
- Password Hashing (Bcrypt)
- Protected API Routes
- SQLAlchemy ORM
- Input Validation
- Secure Dependency Injection

---

# 🎯 Future Enhancements

- Real-time debate rooms
- Voice-to-voice AI opponent
- AI Judge Panel
- Team debates
- Live audience scoring
- Multi-language debates
- AI-generated debate topics
- Cloud deployment support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# 📄 License

Licensed under the **MIT License**.

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star.

Built with ❤️ using **FastAPI**, **React**, **LangGraph**, and **Modern AI Engineering**.

</div>
