from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RoleEnum
from app.services.auth import hash_password, verify_password, create_access_token
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    phone_number: str
    role: str
    password: str

class LoginRequest(BaseModel):
    phone_number: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: int
    name: str
    role: str

@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone_number == data.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    user = User(
        name=data.name,
        phone_number=data.phone_number,
        role=data.role,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return AuthResponse(token=token, user_id=user.id, name=user.name, role=user.role)

@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == data.phone_number).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return AuthResponse(token=token, user_id=user.id, name=user.name, role=user.role)