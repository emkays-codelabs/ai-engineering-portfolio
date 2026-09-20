import uuid

import pytest
from sqlalchemy.exc import IntegrityError


def test_user_defaults_role_to_user_and_is_active_true(db_session):
    from app.models.user import Role, User

    new_user = User(email="alice@example.com", hashed_password="hashed-value")
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)

    assert new_user.role == Role.USER
    assert new_user.is_active is True
    assert isinstance(new_user.id, uuid.UUID)
    assert new_user.created_at is not None


def test_user_email_must_be_unique(db_session):
    from app.models.user import User

    db_session.add(User(email="dup@example.com", hashed_password="h1"))
    db_session.commit()

    db_session.add(User(email="dup@example.com", hashed_password="h2"))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_user_can_be_created_with_admin_role(db_session):
    from app.models.user import Role, User

    admin = User(email="admin@example.com", hashed_password="h", role=Role.ADMIN)
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)

    assert admin.role == Role.ADMIN
