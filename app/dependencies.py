"""FastAPI dependencies shared by protected endpoints."""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import decode_access_token

# Swagger's Authorize button will submit credentials to this form-based endpoint.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the user from the JWT; do not trust user IDs supplied by clients."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        if not isinstance(subject, str):
            raise unauthorized
        user_id = int(subject)
    except (InvalidTokenError, TypeError, ValueError):
        raise unauthorized

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise unauthorized
    return user
