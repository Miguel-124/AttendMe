# backend/main.py
from fastapi import FastAPI
# Import routerów (upewnij się, że ścieżki są poprawne)
from routers import attender_group_router, course_router, user_router

app = FastAPI(
    title="AttendMe backend",
    version="0.1.0",
    # Możesz dodać opis, kontakt, licencję itp.
)

# Rejestracja routerów
app.include_router(attender_group_router.router)
app.include_router(course_router.router)
app.include_router(user_router.router)

# Przykładowy endpoint główny
@app.get("/")
def read_root():
    return {"message": "Witamy w AttendMe API (FastAPI)"}