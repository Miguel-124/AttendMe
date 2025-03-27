# app_models/user.py
from pydantic import BaseModel, Field
from typing import Optional

class Student(BaseModel):
    studentId: int = Field(..., example=0)
    albumIdNumber: int = Field(..., example=0)
    currentYearOfStudy: int = Field(..., example=0)

class Teacher(BaseModel):
    teacherId: int = Field(..., example=0)
    academicTitle: str = Field(..., example="string")

class User(BaseModel):
    userId: int = Field(..., example=0)
    loginName: str = Field(..., example="string")
    name: str = Field(..., example="string")
    surname: str = Field(..., example="string")
    studentId: int = Field(..., example=0)
    teacherId: int = Field(..., example=0)
    student: Student
    teacher: Teacher
    deviceName: str = Field(..., example="string")
    isAdmin: bool = Field(..., example=True)

class TokenResult(BaseModel):
    token: str
    expires: Optional[str] = None