# backend/main.py
from fastapi import FastAPI
from routers import attender_group_router, course_router, user_router

app = FastAPI(
    title="AttendMe backend",
    version="0.1.0",
)

# Rejestracja routerów
app.include_router(attender_group_router)
app.include_router(course_router)
app.include_router(user_router)

# Przykładowy endpoint główny
@app.get("/")
def read_root():
    return {"message": "Witamy w AttendMe API (FastAPI)"}