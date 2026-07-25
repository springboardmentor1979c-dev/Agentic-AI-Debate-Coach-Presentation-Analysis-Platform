from fastapi import APIRouter, Depends, HTTPException

from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(current_user=Depends(get_current_user)):

    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Access Denied"
        )

    return {
        "message": "Welcome Admin"
    }