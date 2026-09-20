import uuid
from datetime import UTC, datetime

import jwt

from app.core.security import create_access_token, create_refresh_token, decode_token
from app.exceptions.auth_exceptions import InvalidRefreshTokenError
from app.models.user import User
from app.repositories.token_repository import TokenRepository
from app.repositories.user_repository import UserRepository


class TokenService:
    def __init__(self, user_repo: UserRepository, token_repo: TokenRepository):
        self._user_repo = user_repo
        self._token_repo = token_repo

    def issue_tokens(self, user: User) -> tuple[str, str, str]:
        """Returns (access_token, refresh_token, refresh_token_jti)."""
        access_token = create_access_token(user_id=user.id, role=user.role.value)
        refresh_token, refresh_jti = create_refresh_token(user_id=user.id)
        return access_token, refresh_token, refresh_jti

    def refresh(self, refresh_token: str) -> tuple[str, str, str]:
        """Validates, rotates, and reuse-rejects a refresh token per ADR-0002.

        Returns a brand-new (access_token, refresh_token, refresh_token_jti) triple.
        The presented token's jti is blacklisted so it can never be redeemed again —
        a replay of it after this point is rejected as reuse.
        """
        try:
            payload = decode_token(refresh_token)
        except jwt.PyJWTError as exc:
            raise InvalidRefreshTokenError() from exc

        if payload.get("type") != "refresh":
            raise InvalidRefreshTokenError()

        jti = payload["jti"]
        if self._token_repo.is_blacklisted(jti):
            raise InvalidRefreshTokenError()

        user = self._user_repo.get_by_id(uuid.UUID(payload["sub"]))
        if user is None or not user.is_active:
            raise InvalidRefreshTokenError()

        expires_at = datetime.fromtimestamp(payload["exp"], tz=UTC)
        self._token_repo.blacklist(
            jti=jti, user_id=user.id, token_type="refresh", expires_at=expires_at
        )

        return self.issue_tokens(user)

    def logout(self, refresh_token: str | None) -> None:
        """Best-effort revocation. Deliberately lenient — a missing, malformed,
        expired, wrong-typed, or already-revoked token is silently a no-op rather
        than an error: logout must always succeed from the client's perspective.
        """
        if refresh_token is None:
            return
        try:
            payload = decode_token(refresh_token)
        except jwt.PyJWTError:
            return

        if payload.get("type") != "refresh":
            return

        jti = payload["jti"]
        if self._token_repo.is_blacklisted(jti):
            return

        expires_at = datetime.fromtimestamp(payload["exp"], tz=UTC)
        self._token_repo.blacklist(
            jti=jti, user_id=uuid.UUID(payload["sub"]), token_type="refresh", expires_at=expires_at
        )
