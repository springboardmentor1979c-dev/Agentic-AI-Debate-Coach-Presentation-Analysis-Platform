# 🤖 Agentic AI Debate Coach & Presentation Analysis Platform

An AI-powered platform designed to help users improve their debating, critical thinking, communication, and presentation skills through intelligent analysis, feedback, performance tracking, and presentation evaluation.

## 🎯 Project Overview

The Agentic AI Debate Coach & Presentation Analysis Platform provides an interactive environment where users can:

- Create an account and securely log in
- Participate in AI-assisted debate sessions
- Receive analysis and feedback on their arguments
- Track previous debate sessions
- Monitor performance through a dashboard
- Upload PowerPoint or PDF presentations for analysis
- View presentation analysis results
- Track performance through platform analytics

The project is developed as an AI-powered learning and communication improvement platform aligned with the proposed Infosys project requirements.

## ✨ Key Features

### 🔐 User Authentication
- User registration
- User login
- JWT-based authentication
- Protected application workflows

### 🗣️ AI Debate Coach
- Debate topic selection
- Interactive debate sessions
- Argument evaluation
- AI-assisted feedback
- Counterargument generation
- Logical reasoning and fallacy analysis
- Performance scoring

### 📊 Performance Dashboard
- Debate performance statistics
- Session history
- Performance tracking
- User progress overview

### 📑 Presentation Analysis
- Upload PDF and PowerPoint presentations
- Presentation content extraction
- AI-assisted presentation analysis
- Extracted content preview
- Presentation result page

### 🏆 History & Leaderboard
- View previous debate sessions
- Track debate performance
- Compare performance through leaderboard functionality

## 🏗️ System Architecture

```text
                ┌──────────────────────────────┐
                │        Frontend              │
                │   HTML / CSS / JavaScript    │
                └──────────────┬───────────────┘
                               │
                               │ REST API
                               ▼
                ┌──────────────────────────────┐
                │         FastAPI Backend      │
                │      Python Application      │
                └──────────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        Authentication    Debate Analysis   Presentation
          & Users            & Scoring        Analysis
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                         Data Storage

## 🚀 How to Run the Project

### 1. Clone the Repository

git clone https://github.com/springboardmentor1979c-dev/Agentic-AI-Debate-Coach-Presentation-Analysis-Platform.git

### 2. Navigate to the Project

cd Agentic-AI-Debate-Coach-Presentation-Analysis-Platform

### 3. Setup the Backend

cd Backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

### 4. Start the FastAPI Server

python -m uvicorn main:app --reload

The backend will run at:

http://127.0.0.1:8000

### 5. Start the Frontend

Open the `Frontend` folder in VS Code and run it using Live Server.

The frontend will normally be available at:

http://127.0.0.1:5500/Frontend/

## 🔄 Application Workflow

Register
   ↓
Login
   ↓
Dashboard
   ↓
Debate Session / Presentation
   ↓
AI Analysis / Upload PDF or PPT
   ↓
Feedback & Score / Presentation Result
   ↓
History / Performance

## 🎓 Project Objective

The platform aims to support improvement in:

- Debate skills
- Argument quality
- Critical thinking
- Logical reasoning
- Communication
- Presentation skills
- Public speaking confidence

The project follows the proposed direction of combining AI-powered argument analysis, feedback, presentation analytics, and performance tracking into a unified learning platform.

## 🔒 Security

The application includes:

- JWT-based authentication
- Password hashing
- Protected API endpoints
- Token-based authorization
- Sensitive local files excluded through `.gitignore`

## 📌 Project Scope

The current implementation focuses on the core functional workflow of authentication, debate coaching, performance tracking, and presentation analysis.

The broader project proposal also describes advanced capabilities such as speech analytics, OAuth2, personalized learning plans, advanced AI debate simulation, reporting/export, containerization, and cloud deployment. These can be integrated as future enhancements.

## 🔮 Future Enhancements

- Advanced speech and voice analysis
- OAuth2/social authentication
- Personalized learning plans
- Advanced AI opponent simulation
- PDF and Excel report export
- Educator and administrator dashboards
- Docker containerization
- Cloud deployment
- Advanced analytics and recommendations

## 👩‍💻 Project

**Agentic AI Debate Coach & Presentation Analysis Platform**

Developed as part of the Infosys Springboard internship/project initiative.