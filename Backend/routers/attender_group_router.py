# backend/routers/attender_group_router.py
from fastapi import APIRouter, Query, HTTPException, status
from utils.auth import user_has_permission
from datetime import datetime, timezone
from app_models import AttenderGroup

router = APIRouter(
    prefix="/attendergroup",
    tags=["AttenderGroup"]
)

@router.post("/save", response_model=AttenderGroup)
def save_attender_group(group: AttenderGroup):
    """
    POST /attendergroup/save
    Zwraca zapisaną grupę.
    """
    if not user_has_permission():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Brak uprawnień do wykonania tej operacji."
        )
    group.attenderGroupId = 123
    group.dateCreated = datetime.now(timezone.utc)
    return group

@router.post("/member/add")
def add_attender_group_member(
    attenderGroupId: int = Query(...),
    userId: int = Query(...)
):
    """
    POST /attendergroup/member/add
    Dodaje użytkownika do grupy.
    """
    return {"status": "Member added", "attenderGroupId": attenderGroupId, "userId": userId}