# app_models/user.py
from pydantic import BaseModel, Field
from typing import Optional

class Student(BaseModel):
    studentId: int = Field(..., example=0)
    albumIdNumber: int = Field(..., example=0)
    currentYearOfStudy: int = Field(..., example=0)
    dateCreated: Optional[str] = None

def StudentUserDTO(BaseModel):
    userID: int
    name: str
    surname: str
    albumIdNumber: int

class Teacher(BaseModel):
    teacherId: int = Field(..., example=0)
    academicTitle: str = Field(..., example="string")
    dateCreated: Optional[str] = None

def TeacherUserDTO(BaseModel):
    userID: int
    name: str
    surname: str
    academicTitle: str

class User(BaseModel):
    userId: int = Field(..., example=0)
    loginName: str = Field(..., example="string")
    name: str = Field(..., example="string")
    surname: str = Field(..., example="string")
    studentId: int = Field(..., example=0)
    teacherId: int = Field(..., example=0)
    student: Student
    isStudent: bool = Field(..., example=True)
    teacher: Teacher
    isTeacher: bool = Field(..., example=True)
    deviceCreated: Optional[str] = None
    deviceName: str = Field(..., example="string")
    isAdmin: bool = Field(..., example=True)

class TokenResult(BaseModel):
    token: str
    expires: Optional[str] = None