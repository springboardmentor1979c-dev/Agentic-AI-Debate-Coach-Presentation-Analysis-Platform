from fastapi import APIRouter

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("")
async def get_user_notifications():
    return [
        {
            "id": 1,
            "type": "reminder",
            "title": "Upcoming Oxford Debate Practice",
            "message": "Scheduled debate session on 'AI Regulation' starts in 30 minutes.",
            "time": "10 mins ago",
            "unread": True
        },
        {
            "id": 2,
            "type": "coaching",
            "title": "New Coach Feedback Available",
            "message": "Coach Marcus reviewed your latest presentation speech analysis.",
            "time": "2 hours ago",
            "unread": True
        },
        {
            "id": 3,
            "type": "achievement",
            "title": "Fallacy Neutralizer Badge Unlocked",
            "message": "You successfully avoided Ad Hominem & Straw Man fallacies in 5 consecutive debates!",
            "time": "1 day ago",
            "unread": False
        }
    ]
