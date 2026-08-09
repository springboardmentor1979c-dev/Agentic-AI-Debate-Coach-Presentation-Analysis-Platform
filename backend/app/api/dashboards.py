from fastapi import APIRouter

router = APIRouter(prefix="/dashboards", tags=["Dashboards & Analytics"])

@router.get("/learner")
async def get_learner_dashboard():
    return {
        "stats": {
            "total_debates": 18,
            "win_rate": 77.8,
            "avg_score": 82.4,
            "presentations_analyzed": 12,
            "fallacies_neutralized": 34
        },
        "recent_debates": [
            {"id": 101, "topic": "AI Ethics & Algorithmic Governance", "format": "Oxford", "score": 85.5, "date": "2026-08-07"},
            {"id": 102, "topic": "Global Carbon Taxation Policy", "format": "Parliamentary", "score": 79.0, "date": "2026-08-04"},
            {"id": 103, "topic": "Universal Basic Income Feasibility", "format": "1v1 AI Simulation", "score": 84.2, "date": "2026-07-29"}
        ],
        "skill_breakdown": {
            "Argument Quality": 84.0,
            "Evidence Usage": 80.0,
            "Logical Consistency": 85.0,
            "Rebuttal Effectiveness": 78.0,
            "Communication Skills": 83.0
        },
        "score_history": [
            {"month": "May", "score": 72.0},
            {"month": "Jun", "score": 76.4},
            {"month": "Jul", "score": 79.8},
            {"month": "Aug", "score": 82.4}
        ]
    }

@router.get("/coach")
async def get_coach_dashboard():
    return {
        "active_students": 24,
        "pending_reviews": 5,
        "coaching_hours": 42.5,
        "avg_student_growth": "+14.2%",
        "students": [
            {"id": 1, "name": "Alex Chen", "level": "Intermediate", "avg_score": 84.2, "weak_area": "Evidence Citations"},
            {"id": 2, "name": "Sophia Rodriguez", "level": "Advanced", "avg_score": 89.5, "weak_area": "Filler Words (WPM)"},
            {"id": 3, "name": "Marcus Vance", "level": "Beginner", "avg_score": 71.0, "weak_area": "Straw Man Fallacy"},
            {"id": 4, "name": "Emily Watson", "level": "Intermediate", "avg_score": 81.8, "weak_area": "Rebuttal Timing"}
        ]
    }

@router.get("/educator")
async def get_educator_dashboard():
    return {
        "class_name": "AP Rhetoric & Public Debate 2026",
        "total_enrolled": 32,
        "class_average_score": 81.6,
        "format_performance": [
            {"format": "Oxford", "avg_score": 84.5},
            {"format": "Parliamentary", "avg_score": 79.8},
            {"format": "Public Forum", "avg_score": 82.1},
            {"format": "Policy", "avg_score": 78.4}
        ],
        "top_performers": [
            {"rank": 1, "name": "Sophia Rodriguez", "score": 92.1},
            {"rank": 2, "name": "David Kim", "score": 88.7},
            {"rank": 3, "name": "Alex Chen", "score": 86.4}
        ]
    }

@router.get("/admin")
async def get_admin_dashboard():
    return {
        "platform_metrics": {
            "total_users": 1240,
            "active_debates_today": 84,
            "llm_api_latency_ms": 142,
            "speech_engine_accuracy": 98.4,
            "system_uptime": 99.98
        },
        "role_distribution": {
            "Learners": 1050,
            "Debate Coaches": 120,
            "Educators": 60,
            "Administrators": 10
        },
        "system_status": [
            {"service": "FastAPI Core API", "status": "Operational", "latency": "12ms"},
            {"service": "Logical Fallacy Engine", "status": "Operational", "latency": "8ms"},
            {"service": "Speech Prosody Engine", "status": "Operational", "latency": "35ms"},
            {"service": "AI Opponent Generator", "status": "Operational", "latency": "140ms"}
        ]
    }
