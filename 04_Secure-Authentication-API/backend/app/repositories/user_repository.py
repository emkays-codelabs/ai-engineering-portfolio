import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """The only layer allowed to touch the `users` table directly."""

    def __init__(self, db: Session):
        self._db = db

    def get_by_email(self, email: str) -> User | None:
        return self._db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return self._db.get(User, user_id)

    def list_all(self) -> list[User]:
        return list(self._db.execute(select(User)).scalars().all())

    def create(self, email: str, hashed_password: str) -> User:
        user = User(email=email, hashed_password=hashed_password)
        self._db.add(user)
        self._db.commit()
        self._db.refresh(user)
        return user
