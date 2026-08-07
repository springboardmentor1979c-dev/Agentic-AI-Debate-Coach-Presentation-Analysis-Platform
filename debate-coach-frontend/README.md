# ⚡ Debate Coach — React Frontend

Premium dark-mode React + Vite frontend for the Agentic AI Debate Coach & Presentation Analysis Platform.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# http://localhost:5173
```

Make sure the backend is running on `http://localhost:8000` before starting.

---

## 📁 Structure

```
src/
├── App.jsx             # Root component + sidebar navigation
├── AuthContext.jsx     # Global authentication state (JWT)
├── api.js              # Centralized API client (all fetch calls)
├── index.css           # Premium dark-mode design system
└── pages/
    ├── AuthPage.jsx            # Login / Register
    ├── DashboardPage.jsx       # Role-based dashboard
    ├── DebateSessionsPage.jsx  # Create & manage debates
    ├── AnalysisPage.jsx        # Argument & fallacy analysis
    ├── SimulationPage.jsx      # AI debate simulation
    ├── PresentationPage.jsx    # Presentation analytics
    ├── CoachingPage.jsx        # Coaching & learning path
    └── ReportsPage.jsx         # Performance reports
```

---

## 🔧 Environment

The frontend connects to the backend at `http://localhost:8000` by default.  
To change this, update the `BASE_URL` in `src/api.js`.

---

## 🐳 Docker (Production)

```bash
docker build -t debate-coach-frontend .
docker run -p 80:80 debate-coach-frontend
```

Uses Nginx to serve the built React app and proxy `/api` requests to the backend.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Vanilla CSS (dark-mode design system) |
| **Web Server** | Nginx (Docker) |

---

## 📝 License

MIT — Built for educational purposes.
