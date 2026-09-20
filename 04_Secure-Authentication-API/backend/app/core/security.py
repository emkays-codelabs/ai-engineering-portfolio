import uuid
from datetime import UTC, datetime, timedelta

import jwt
from passlib.context import CryptContext

from app.core.config import Settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_settings = Settings()


def hash_password(plain_password: str) -> str:
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def _create_token(
    subject: uuid.UUID, token_type: str, expires_delta: timedelta, **extra_claims
) -> tuple[str, str]:
    jti = str(uuid.uuid4())
    now = datetime.now(UTC)
    payload = {
        "sub": str(subject),
        "type": token_type,
        "jti": jti,
        "iat": now,
        "exp": now + expires_delta,
        **extra_claims,
    }
    token = jwt.encode(payload, _settings.secret_key, algorithm=_settings.algorithm)
    return token, jti


def create_access_token(user_id: uuid.UUID, role: str) -> str:
    token, _jti = _create_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=_settings.access_token_expire_minutes),
        role=role,
    )
    return token


def create_refresh_token(user_id: uuid.UUID) -> tuple[str, str]:
    return _create_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=_settings.refresh_token_expire_days),
    )


def decode_token(token: str) -> dict:
    """Verifies signature, algorithm, and expiry. Raises a jwt.PyJWTError subclass on failure."""
    return jwt.decode(token, _settings.secret_key, algorithms=[_settings.algorithm])
