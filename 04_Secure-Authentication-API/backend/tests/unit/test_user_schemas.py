import uuid
from datetime import UTC, datetime

import pytest
from pydantic import ValidationError


def test_user_create_rejects_invalid_email():
    from app.schemas.user import UserCreate

    with pytest.raises(ValidationError):
        UserCreate(email="not-an-email", password="a-valid-password")


def test_user_create_rejects_password_shorter_than_8_chars():
    from app.schemas.user import UserCreate

    with pytest.raises(ValidationError):
        UserCreate(email="alice@example.com", password="short")


def test_user_create_accepts_a_valid_payload():
    from app.schemas.user import UserCreate

    payload = UserCreate(email="alice@example.com", password="a-valid-password")

    assert payload.email == "alice@example.com"
    assert payload.password == "a-valid-password"


def test_user_read_builds_from_an_orm_object_and_excludes_the_password_hash():
    from app.models.user import Role
    from app.schemas.user import UserRead

    class _FakeOrmUser:
        id = uuid.uuid4()
        email = "alice@example.com"
        hashed_password = "super-secret-hash"
        role = Role.USER
        is_active = True
        created_at = datetime.now(UTC)

    read_model = UserRead.model_validate(_FakeOrmUser())

    assert read_model.email == "alice@example.com"
    assert "hashed_password" not in read_model.model_dump()
