import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.token_blacklist import TokenBlacklist


class TokenRepository:
    """The only layer allowed to touch the `token_blacklist` table directly."""

    def __init__(self, db: Session):
        self._db = db

    def is_blacklisted(self, jti: str) -> bool:
        stmt = select(TokenBlacklist).where(TokenBlacklist.jti == jti)
        return self._db.execute(stmt).scalar_one_or_none() is not None

    def blacklist(
        self, jti: str, user_id: uuid.UUID, token_type: str, expires_at: datetime
    ) -> TokenBlacklist:
        entry = TokenBlacklist(
            jti=jti, user_id=user_id, token_type=token_type, expires_at=expires_at
        )
        self._db.add(entry)
        self._db.commit()
        self._db.refresh(entry)
        return entry
