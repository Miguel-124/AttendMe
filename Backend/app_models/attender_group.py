# app_models/attender_group.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app_models import User

class AttendanceLog(BaseModel):
    attendanceLogId: int = Field(..., example=0)
    attenderUserId: int = Field(..., example=0)
    courseSessionId: int = Field(..., example=0)

class AttenderGroupMember(BaseModel):
    attenderGroupMemberId: int = Field(..., example=0)
    memberUserId: int = Field(..., example=0)
    memberUser: User
    attenderGroupId: int = Field(..., example=0)
    attenderGroup: str = Field(..., example="string")
    dateCreated: Optional[datetime] = Field(None, example="2025-03-26T21:14:28.702Z")

class AttenderGroup(BaseModel):
    attenderGroupId: int = Field(..., example=0)
    groupName: str = Field(..., example="string")
    yearOfStudy: int = Field(..., example=0)
    studyDirection: str = Field(..., example="string")
    dateCreated: Optional[datetime] = Field(None, example="2025-03-26T21:14:28.702Z")
    attenderGroupMembers: List[AttenderGroupMember] = Field(default_factory=list)

    class Config:
        title = "AttenderGroup"