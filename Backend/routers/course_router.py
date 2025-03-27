from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from datetime import datetime
from app_models.course import Course, CourseGroup

router = APIRouter(
    prefix="/course",
    tags=["Course"]
)

@router.post("/save", response_model=Course)
def save_course(course: Course):
    """
    POST /course/save
    Tworzy/aktualizuje obiekt kursu.
    """
    course.courseId = 456
    course.dateCreated = datetime.utcnow()
    return course

@router.post("/group/save", response_model=CourseGroup)
def save_course_group(course_group: CourseGroup):
    """
    POST /course/group/save
    Tworzy/aktualizuje obiekt grupy kursu.
    """
    course_group.courseGroupId = 999
    return course_group

@router.post("/group/teacher/assign")
def assign_teacher_to_group(
    courseGroupId: int = Query(...),
    teacherUserId: int = Query(...)
):
    """
    POST /course/group/teacher/assign
    Przypisuje prowadzącego do grupy.
    """
    # Przykładowa logika
    return {"status": "Teacher assigned", "courseGroupId": courseGroupId, "teacherUserId": teacherUserId}

# I tak dalej – stwórz endpointy dla:
# - /course/group/attender-user/add
# - /course/group/attender-group/add
# - /course/teacher/session/get
# - ...