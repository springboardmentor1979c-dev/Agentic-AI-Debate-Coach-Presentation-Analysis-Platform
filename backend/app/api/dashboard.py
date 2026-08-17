from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/learner")
def learner_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
        },

        "stats": [
            {
                "name": "Debate Score",
                "value": "84/100",
                "description": "+4.5% vs last week",
            },
            {
                "name": "Presentation Score",
                "value": "78/100",
                "description": "+2.1% vs last week",
            },
            {
                "name": "Sessions",
                "value": "18",
                "description": "5 completed this week",
            },
            {
                "name": "Confidence",
                "value": "92%",
                "description": "Highly consistent",
            },
            {
                "name": "Streak",
                "value": "7 Days",
                "description": "Personal Best",
            },
            {
                "name": "Improvement",
                "value": "+14%",
                "description": "Top 5%",
            },
        ],

        "trendData": [
            {"name": "Week 1", "debate": 68, "presentation": 64},
            {"name": "Week 2", "debate": 72, "presentation": 69},
            {"name": "Week 3", "debate": 75, "presentation": 72},
            {"name": "Week 4", "debate": 81, "presentation": 74},
            {"name": "Week 5", "debate": 84, "presentation": 78},
        ],

        "skillData": [
            {"subject": "Structure", "A": 90, "fullMark": 100},
            {"subject": "Refutation", "A": 75, "fullMark": 100},
            {"subject": "Speech Pace", "A": 85, "fullMark": 100},
            {"subject": "Body Language", "A": 80, "fullMark": 100},
            {"subject": "Tone", "A": 70, "fullMark": 100},
            {"subject": "Clarity", "A": 92, "fullMark": 100},
        ],

        "recentActivity": [
            {
                "title": "AI Sparring",
                "type": "Debate",
                "date": "Yesterday",
                "score": "88/100",
                "badge": "bg-blue-500",
            },
            {
                "title": "Tech Talk",
                "type": "Presentation",
                "date": "3 days ago",
                "score": "82/100",
                "badge": "bg-purple-500",
            },
        ],

        "exercises": [
            {
                "name": "Speed Control Challenge",
                "type": "Voice Practice",
                "dur": "5 min",
                "xp": "+100 XP",
            },
            {
                "name": "Oxford Debate",
                "type": "AI Debate",
                "dur": "10 min",
                "xp": "+250 XP",
            },
        ],
    }