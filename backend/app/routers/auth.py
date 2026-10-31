from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import RegisterIn, LoginIn, UserOut, TokenOut
from app.security import hash_password, verify_password, create_access_token, get_current_user
router = APIRouter(prefix="/auth", tags=["Authentication"])
@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "Email is already registered")
    user = User(email=email, password_hash=hash_password(payload.password), full_name=payload.full_name)
    db.add(user); db.commit(); db.refresh(user)
    return user
@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return TokenOut(access_token=create_access_token(user.id))
@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
