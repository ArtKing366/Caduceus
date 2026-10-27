"""Registration, login, JWT issuance, and current-user profile endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import TokenResponse, UserLogin, UserRead, UserRegister, UserUpdate
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _find_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    return db.scalars(
        select(User).where(func.lower(User.email) == normalized_email)
    ).first()


def _authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = _find_user_by_email(db, email)
    if user is None or not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def _make_token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user=UserRead.model_validate(user),
    )


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register_user(payload: UserRegister, db: Session = Depends(get_db)) -> User:
    email = payload.email.strip().lower()

    if _find_user_by_email(db, email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        # Also handles a race where two requests register the same email.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with JSON credentials",
)
def login_json(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = _authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _make_token_response(user)


@router.post(
    "/token",
    response_model=TokenResponse,
    include_in_schema=True,
    summary="Login using OAuth2 form (for Swagger Authorize)",
)
def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    # OAuth2PasswordRequestForm names the username field "username"; for this
    # application users enter their email address in that field.
    user = _authenticate_user(db, form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _make_token_response(user)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get the currently authenticated user",
)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch(
    "/me",
    response_model=UserRead,
    summary="Update the current user's profile",
)
def update_current_user(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No profile fields were provided.",
        )

    # UserUpdate currently permits updating full_name only.
    for field, value in changes.items():
        setattr(current_user, field, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
