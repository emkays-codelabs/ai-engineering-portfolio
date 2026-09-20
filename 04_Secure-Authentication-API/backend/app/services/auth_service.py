import uuid

import jwt

from app.core.security import decode_token, hash_password, verify_password
from app.exceptions.auth_exceptions import (
    EmailAlreadyRegisteredError,
    InvalidAccessTokenError,
    InvalidCredentialsError,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self._user_repo = user_repo

    def register(self, email: str, password: str) -> User:
        if self._user_repo.get_by_email(email) is not None:
            raise EmailAlreadyRegisteredError(email)
        return self._user_repo.create(email=email, hashed_password=hash_password(password))

    def authenticate(self, email: str, password: str) -> User:
        user = self._user_repo.get_by_email(email)
        credentials_valid = user is not None and verify_password(password, user.hashed_password)
        if not credentials_valid or not user.is_active:
            raise InvalidCredentialsError()
        return user

    def get_current_user(self, access_token: str) -> User:
        try:
            payload = decode_token(access_token)
        except jwt.PyJWTError as exc:
            raise InvalidAccessTokenError() from exc

        if payload.get("type") != "access":
            raise InvalidAccessTokenError()

        user = self._user_repo.get_by_id(uuid.UUID(payload["sub"]))
        if user is None or not user.is_active:
            raise InvalidAccessTokenError()
        return user
