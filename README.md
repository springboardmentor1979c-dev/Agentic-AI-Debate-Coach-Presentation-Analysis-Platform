# 🎓 AI Debate Coach - Presentation Analysis Platform

An intelligent platform that leverages AI to coach users through debates and presentations, providing real-time feedback, performance analysis, and personalized coaching plans.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Project Status](#project-status)
- [License](#license)

---

## 🌟 Overview

The **AI Debate Coach** is a comprehensive platform designed to help users improve their debating and presentation skills through:

- **Interactive AI Debates**: Engage with AI opponents in structured debate sessions
- **Presentation Analysis**: Submit presentations for AI-powered analysis and feedback
- **Skill Tracking**: Monitor progress across multiple debate-related skills
- **Personalized Coaching**: Receive customized coaching plans based on performance
- **Performance Metrics**: Detailed analytics and scoring with percentile rankings
- **Real-time Notifications**: Get alerts for coaching recommendations and milestones
- **Search & Analytics**: Discover arguments and track debate analytics

The platform combines **LLM-powered AI** (OpenAI/Anthropic), **vector search** (FAISS), and **real-time monitoring** to deliver an engaging learning experience.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt hashing
- **LLM Integration**: OpenAI & Anthropic APIs
- **Vector Store**: FAISS for semantic search
- **Caching**: Redis
- **Message Queue**: Kafka (for async processing)
- **Monitoring**: Prometheus + FastAPI Instrumentator
- **Reports**: ReportLab, openpyxl

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: React Context API
- **UI**: Responsive components with TailwindCSS

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **API Server**: Uvicorn

---

## 📁 Project Structure

```
├── debate_coach_api/              # Backend (FastAPI)
│   ├── main.py                    # Application entry point
│   ├── config.py                  # Configuration settings
│   ├── database.py                # Database setup & connection
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Container image
│   ├── docker-compose.yml         # Multi-container setup
│   ├── models/                    # Database models
│   ├── routers/                   # API route handlers
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── ai_debate.py          # AI debate endpoints
│   │   ├── debates.py            # Debate management
│   │   ├── presentations.py      # Presentation submission
│   │   ├── coaching.py           # Coaching plans
│   │   ├── arguments.py          # Argument database
│   │   ├── scoring.py            # Scoring & rankings
│   │   ├── analytics.py          # Performance analytics
│   │   ├── reports.py            # Report generation
│   │   └── [other routers]       # Additional endpoints
│   ├── schemas/                   # Pydantic request/response models
│   ├── services/                  # Business logic
│   │   ├── llm_engine.py         # LLM integration
│   │   ├── vector_store.py       # FAISS vector search
│   │   ├── agent_orchestrator.py # Multi-agent orchestration
│   │   ├── kafka_producer.py     # Event streaming
│   │   └── [other services]      # Additional services
│   ├── utils/                     # Utility functions
│   └── monitoring/                # Prometheus configuration
│
├── frontend/                      # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── main.tsx              # Application entry
│   │   ├── App.tsx               # Root component
│   │   ├── api/                  # API client
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard/        # User dashboards
│   │   │   ├── AIDebate/         # Debate interface
│   │   │   ├── Presentations/    # Presentation submission
│   │   │   ├── Coaching/         # Coaching interface
│   │   │   └── [other pages]
│   │   ├── context/              # React contexts (Auth, etc.)
│   │   ├── types/                # TypeScript types
│   │   └── index.css             # Global styles
│   ├── tailwind.config.js        # Tailwind configuration
│   ├── vite.config.ts            # Vite configuration
│   ├── package.json              # Node dependencies
│   └── public/                    # Static assets
│
├── RUN.md                         # Detailed run instructions
├── TODO.md                        # Project progress tracker
├── PDF_ALIGNMENT.md               # PDF alignment documentation
├── LICENSE                        # License file
└── README.md                      # This file
```

---

## 📦 Prerequisites

Before running the project, ensure you have:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL 12+** (optional, for production)
- **Docker & Docker Compose** (optional, for containerized setup)

### Environment Variables

Create a `.env` file in the `debate_coach_api` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/debate_coach_db

# JWT
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM APIs
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Redis
REDIS_URL=redis://localhost:6379/0

# Kafka
KAFKA_BROKER=localhost:9092
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd debate-coach-platform
```

### Step 2: Backend Setup

```bash
cd debate_coach_api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Project

### Option 1: Local Development (Recommended)

#### Terminal 1 - Start Backend:

```bash
cd debate_coach_api
venv\Scripts\activate  # or source venv/bin/activate on macOS/Linux
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

#### Terminal 2 - Start Frontend:

```bash
cd frontend
npm run dev
```

**Frontend URL**: http://localhost:5173

### Option 2: Docker Compose

```bash
# Build and run all services
docker-compose up --build

# Access frontend at http://localhost:3000
# Access backend at http://localhost:8000
```

---

## 📚 API Documentation

### Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/refresh` - Refresh token

#### AI Debates
- `POST /ai-debate/start` - Start a new AI debate session
- `POST /ai-debate/{session_id}/message` - Send message in debate
- `GET /ai-debate/{session_id}` - Get debate session details

#### Presentations
- `POST /presentations/submit` - Submit a presentation for analysis
- `GET /presentations/{id}` - Get presentation analysis results
- `GET /presentations/` - List user's presentations

#### Coaching
- `GET /coaching/plan/{user_id}` - Get personalized coaching plan
- `GET /coaching/skills/{user_id}` - Get skill progress tracking

#### Analytics
- `GET /analytics/performance` - Get performance metrics
- `GET /analytics/progress` - Get progress over time

#### Search
- `GET /search/arguments` - Search debate arguments
- `GET /search/debates` - Search debate sessions

For full API documentation, visit: **http://localhost:8000/docs**

---

## ✨ Features

### 🤖 AI Debate Engine
- Real-time debate with AI opponents
- Multiple debate formats and topics
- Argument evaluation with scoring
- Debate history tracking

### 📊 Presentation Analysis
- Submit presentation transcripts for analysis
- AI-powered feedback on content, structure, and delivery
- Performance metrics and scoring
- Comparison with peer presentations

### 🎯 Personalized Coaching
- AI-generated coaching plans based on performance
- Skill progression tracking (7+ debate-related skills)
- Milestone achievements and notifications
- Progress reports and recommendations

### 📈 Analytics Dashboard
- User dashboards (Learner, Coach, Admin)
- Performance trends and comparisons
- Argument effectiveness analysis
- Detailed scoring and percentile rankings

### 🔔 Notifications
- Real-time notifications for coaching recommendations
- Milestone achievements
- Debate invitations and responses

### 🔍 Search & Discovery
- Semantic search for relevant arguments
- Browse debate topics and sessions
- Find similar presentations

---

## 📊 Project Status

### ✅ Completed
- Backend API with all core endpoints
- Frontend UI with authentication and dashboards
- Database schema with relationships
- AI integration (LLM engines)
- Vector store (FAISS) for semantic search
- Authentication & authorization
- Comprehensive demo data (12 users, 6 debates, 12 arguments, etc.)
- API route fixes and frontend client fixes

### 🚧 In Progress
- Performance optimization
- Additional analytics features
- Enhanced coaching algorithms

### 📋 Planned
- Mobile app
- Real-time WebSocket support
- Advanced reporting features
- Machine learning model training pipeline

See [TODO.md](TODO.md) for detailed progress tracking.

---

## 🧪 Testing

### Run Backend Tests

```bash
cd debate_coach_api
python -m pytest
```

### Run Frontend Tests

```bash
cd frontend
npm run test
```

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t debate-coach-api ./debate_coach_api

# Run container
docker run -p 8000:8000 --env-file .env debate-coach-api
```

### Production Configuration

For production deployment:

1. Set `DEBUG=False` in config
2. Use environment variables for sensitive data
3. Configure proper database (PostgreSQL recommended)
4. Set up Redis for caching
5. Configure SSL/TLS
6. Use a production ASGI server (Gunicorn + Uvicorn)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

- Development Team: springboardmentor1979c-dev

---

## 📞 Support & Questions

For issues, questions, or suggestions:

1. Check the [RUN.md](RUN.md) for detailed setup instructions
2. Review the [API documentation](http://localhost:8000/docs)
3. Check the [TODO.md](TODO.md) for known issues and planned features
4. Open an issue in the repository

---

## 🔐 Security Notes

- Never commit `.env` files to version control
- Keep API keys secure and rotate regularly
- Use HTTPS in production
- Keep dependencies updated (`pip install --upgrade -r requirements.txt`)
- Review Docker best practices for production deployment

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Last Updated**: August 2026  
**Version**: 1.0.0
