# backend/routers/__init__.py
# Re-export routerów, dzięki czemu w main.py możesz zaimportować je z jednego miejsca
from .attender_group_router import router as attender_group_router
from .course_router import router as course_router
from .user_router import router as user_router