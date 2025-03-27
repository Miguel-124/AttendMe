# app_models/course.py
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from app_models import AttenderGroup, AttendanceLog, User


class CourseGroupAttenderGroupAssigment(BaseModel):
    courseGroupAttenderGroupAssigmentId: int = Field(..., example=0)
    courseGroupId: int = Field(..., example=0)
    attenderGroupId: int = Field(..., example=0)
    isExcluded: bool = Field(..., example=True)
    courseGroup: str = Field(..., example="string")
    attenderGroup: AttenderGroup

class CourseGroupUserAssigment(BaseModel):
    courseGroupUserAssigmentId: int = Field(..., example=0)
    courseGroupId: int = Field(..., example=0)
    courseGroup: str = Field(..., example="string")
    userId: int = Field(..., example=0)
    isExcluded: bool = Field(..., example=True)
    user: User

class CourseSession(BaseModel):
    courseSessionId: int = Field(..., example=0)
    courseGroupId: int = Field(..., example=0)
    courseGroup: str = Field(..., example="string")
    locationName: str = Field(..., example="string")
    dateStart: datetime = Field(..., example="2025-03-26T21:17:42.158Z")
    dateEnd: datetime = Field(..., example="2025-03-26T21:17:42.158Z")
    attendanceLogs: List[AttendanceLog] = Field(...)

class CourseGroup(BaseModel):
    courseGroupId: int = Field(..., example=0)
    courseId: int = Field(..., example=0)
    course: str = Field(..., example="string")
    courseGroupType: str = Field(..., example="string")
    courseGroupName: str = Field(..., example="string")
    courseGroupDescription: str = Field(..., example="string")
    teacherUserId: int = Field(..., example=0)
    teacherUser: User
    sessions: List[CourseSession] = Field(..., example=[])
    attenderGroupAssigments: List[CourseGroupAttenderGroupAssigment] = Field(..., example=[])
    userAssigments: List[CourseGroupUserAssigment] = Field(..., example=[])
    yearOfStudy: int = Field(..., example=0)
    semesterCode: str = Field(..., example="string")
    dateStart: datetime = Field(..., example="2025-03-26T21:17:42.158Z")
    dateEnd: datetime = Field(..., example="2025-03-26T21:17:42.158Z")

class Course(BaseModel):
    courseId: int = Field(..., example=0)
    courseName: str = Field(..., max_length=255, example="string")
    courseDescription: str = Field(..., max_length=1024, example="string")
    courseGroups: List[CourseGroup] = Field(..., example=[])