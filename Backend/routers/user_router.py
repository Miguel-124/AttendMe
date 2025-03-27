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

@router.get("/protected")
def protected_route(current_user: str = Depends(verify_token)):
    """
    GET /user/protected
    Endpoint chroniony – dostęp wymaga poprawnego tokena.
    """
    return {"message": f"Witaj, {current_user}! Masz dostęp do chronionej zawartości."}

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
# I tak dalej dla:
# /user/device/reset
# /user/device/register/token/get
# /user/device/register
# /user/attendance/ticket/get
# /user/student/create
# /user/teacher/create