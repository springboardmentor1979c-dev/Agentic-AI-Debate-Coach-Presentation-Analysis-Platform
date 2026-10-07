from fastapi import APIRouter, Depends
from backend.app.core.dependencies import require_roles

router = APIRouter(tags=["Role Specific Dashboards"])

@router.get("/learner")
def learner_dashboard(current_user=Depends(require_roles("Learner"))):
    return {"message": "Welcome Learner"}

@router.get("/coach")
def coach_dashboard(current_user=Depends(require_roles("Coach"))):
    return {"message": "Welcome Coach"}

@router.get("/educator")
def educator_dashboard(current_user=Depends(require_roles("Educator"))):
    return {"message": "Welcome Educator"}

@router.get("/admin")
def admin_dashboard(current_user=Depends(require_roles("Admin"))):
    return {"message": "Welcome Admin"}
