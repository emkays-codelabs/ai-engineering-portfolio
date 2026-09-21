from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy.exc import IntegrityError


def _make_user(db_session, email="alice@example.com"):
    from app.models.user import User

    user = User(email=email, hashed_password="h")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_is_blacklisted_returns_false_for_an_unknown_jti(db_session):
    from app.repositories.token_repository import TokenRepository

    repo = TokenRepository(db_session)

    assert repo.is_blacklisted("never-seen-jti") is False


def test_blacklist_then_is_blacklisted_returns_true(db_session):
    from app.repositories.token_repository import TokenRepository

    owner = _make_user(db_session)
    repo = TokenRepository(db_session)

    repo.blacklist(
        jti="some-jti",
        user_id=owner.id,
        token_type="refresh",
        expires_at=datetime.now(UTC) + timedelta(days=7),
    )

    assert repo.is_blacklisted("some-jti") is True


def test_blacklist_raises_on_duplicate_jti_without_corrupting_the_session(db_session):
    """A concurrent double-insert of the same jti hits the DB unique constraint.
    The repository must roll back so the session stays usable afterward — not
    leave it in SQLAlchemy's 'pending rollback' state for the next caller.
    """
    from app.repositories.token_repository import TokenRepository

    owner = _make_user(db_session)
    repo = TokenRepository(db_session)
    expiry = datetime.now(UTC) + timedelta(days=1)

    repo.blacklist(jti="race-jti", user_id=owner.id, token_type="refresh", expires_at=expiry)

    with pytest.raises(IntegrityError):
        repo.blacklist(jti="race-jti", user_id=owner.id, token_type="refresh", expires_at=expiry)

    # Session must still be usable — proves the repository rolled back on conflict.
    assert repo.is_blacklisted("race-jti") is True
