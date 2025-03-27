from fastapi import APIRouter, Query, HTTPException, Depends
from datetime import timedelta
from utils.auth import create_access_token, verify_token
from app_models import TokenResult, User

router = APIRouter(
    prefix="/user",
    tags=["User"]
)

@router.post("/login", response_model=TokenResult)
def login_user(loginName: str = Query(...), password: str = Query(...)):
    """
    POST /user/login
    Zwraca token JWT po prawidłowym logowaniu.
    """
    # Weryfikacja danych logowania – w prawdziwej aplikacji sprawdź dane w bazie
    if loginName != "admin" or password != "secret":
        raise HTTPException(status_code=401, detail="Nieprawidłowe dane logowania")
    
    # Tworzymy token – klucz "sub" przechowuje nazwę użytkownika
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": loginName},
        expires_delta=access_token_expires
    )
    return TokenResult(token=access_token, expires=None)

@router.post("/device/reset")
def reset_device():
    """
    POST /user/device/reset
    Resetuje dane urządzenia użytkownika.
    """
    return {"status": "Device reset"}

@router.get("/device/register/token/get")
def get_register_device_token():
    """
    GET /user/device/register/token/get
    Zwraca token rejestracji urządzenia.
    """
    return {"token": "string"}

@router.post("/device/register")
def register_device(token: str = Query(...)):
    """
    POST /user/device/register
    Rejestruje urządzenie użytkownika.
    """
    return {"status": "Device registered"}

@router.get("/attendance/ticket/get")
def get_attendance_ticket():
    """
    GET /user/attendance/ticket/get
    Zwraca bilet obecności.
    """
    return {"ticket": "string"}

@router.get("/get", response_model=User)
def get_user(userId: int = Query(...)):
    """
    GET /user/get
    Zwraca dane użytkownika o wskazanym ID.
    """
    return User(
        userId=userId,
        loginName="test",
        name="Jan",
        surname="Kowalski",
        studentId=0,
        teacherId=0,
        student={"studentId": 0, "albumIdNumber": 0, "currentYearOfStudy": 0},
        teacher={"teacherId": 0, "academicTitle": "string"},
        deviceName="string",
        isAdmin=False
    )

@router.post("/student/create")
def create_student(student: User):
    """
    POST /user/student/create
    Tworzy nowego studenta.
    """
    return {"status": "Student created"}

@router.post("/teacher/create")
def create_teacher(teacher: User):
    """
    POST /user/teacher/create
    Tworzy nowego nauczyciela.
    """
    return {"status": "Teacher created"}
