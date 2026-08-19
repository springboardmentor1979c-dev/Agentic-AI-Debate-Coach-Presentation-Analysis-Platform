from fastapi import APIRouter

router = APIRouter(tags=["History"])

history = []


@router.get("/history")
def get_history():
    return history


def save_history(data):
    history.append(data)