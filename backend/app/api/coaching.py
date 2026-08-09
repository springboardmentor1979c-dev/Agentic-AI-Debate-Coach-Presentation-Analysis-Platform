from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/coaching", tags=["Coaching & Recommendations"])

@router.get("/recommendations")
async def get_coaching_recommendations():
    return {
        "personalized_feedback": [
            {
                "category": "Logical Consistency",
                "priority": "High",
                "recommendation": "Watch out for Straw Man premises when refuting opposing economic claims.",
                "drill": "Complete 3 Socratic Reframing exercises in the Argument Studio."
            },
            {
                "category": "Presentation Delivery",
                "priority": "Medium",
                "recommendation": "Reduce verbal fillers ('um', 'you know') during introductory hooks.",
                "drill": "Perform a 2-minute timed speech with zero-filler enforcement in the Presentation Lab."
            },
            {
                "category": "Evidence Integration",
                "priority": "Medium",
                "recommendation": "Anchor policy claims with specific quantitative percentages.",
                "drill": "Review 5 empirical case studies in Oxford debate format."
            }
        ],
        "learning_path": [
            {"step": 1, "title": "Foundations of Toulmin Argument Structure", "status": "Completed"},
            {"step": 2, "title": "Detecting & Neutralizing 8 Core Fallacies", "status": "In-Progress"},
            {"step": 3, "title": "Advanced 4-Step Rebuttal & Cross-Examination", "status": "Upcoming"},
            {"step": 4, "title": "Public Forum & Parliamentary AI Simulations", "status": "Locked"}
        ]
    }
