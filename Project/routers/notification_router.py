"""Notifications Router"""
from __future__ import annotations
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

import database as db
from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def get_notifications(current_user: Annotated[dict, Depends(get_current_user)]):
    """Get all notifications for the current user."""
    return db.get_user_notifications(current_user["id"])


@router.put("/{notif_id}/read")
def mark_as_read(
    notif_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Mark a notification as read."""
    result = db.mark_notification_read(notif_id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result


@router.put("/read-all")
def mark_all_read(current_user: Annotated[dict, Depends(get_current_user)]):
    """Mark all user notifications as read."""
    notifications = db.get_user_notifications(current_user["id"])
    for n in notifications:
        if not n["is_read"]:
            db.mark_notification_read(n["id"])
    return {"message": f"Marked {len(notifications)} notifications as read"}
