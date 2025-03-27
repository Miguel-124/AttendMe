from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status, Depends
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

# Klucz sekretowy – w produkcji powinien być przechowywany bezpiecznie
SECRET_KEY = "twoj_super_tajny_klucz"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Definiujemy schemat OAuth2 – określamy adres, pod którym użytkownik uzyska token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

def user_has_permission():
    """Symulacja sprawdzenia uprawnień użytkownika."""
    return True

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Generuje token JWT na podstawie danych wejściowych."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    """Weryfikuje przekazany token. Zwraca sub (np. nazwę użytkownika) lub podnosi wyjątek."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nie udało się zweryfikować tokenu",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception