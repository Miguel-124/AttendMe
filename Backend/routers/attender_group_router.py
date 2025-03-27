# backend/routers/attender_group_router.py
from fastapi import APIRouter, Query
from datetime import datetime
from app_models.attender_group import AttenderGroup

router = APIRouter(
    prefix="/attendergroup",
    tags=["AttenderGroup"]
)

@router.post("/save", response_model=AttenderGroup)
def save_attender_group(group: AttenderGroup):
    """
    POST /attendergroup/save
    Zwraca zapisaną grupę (w prawdziwej aplikacji zapiszesz ją w bazie).
    """
    group.attenderGroupId = 123
    group.dateCreated = datetime.utcnow()
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