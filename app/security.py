"""Password hashing and JWT utilities for Caduceus."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from dotenv import load_dotenv

# Load the project's root .env when the app is started from the repository root.
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256").strip()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

if len(SECRET_KEY) < 32:
    raise RuntimeError(
        "SECRET_KEY is missing or too short. Generate one with "
        '`py -c "import secrets; print(secrets.token_urlsafe(48))"` '
        "and put it in the project's .env file."
    )

if ACCESS_TOKEN_EXPIRE_MINUTES < 1:
    raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer.")

_password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Return an Argon2id password hash. Never store the plain password."""
    return _password_hasher.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Return False for a wrong password or an invalid stored hash."""
    try:
        return _password_hasher.verify(password_hash, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_access_token(subject: int | str) -> str:
    """Create a signed JWT with a string subject and expiration time."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a signed JWT. Invalid/expired tokens raise PyJWT errors."""
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
        options={"require": ["sub", "exp"]},
    )
