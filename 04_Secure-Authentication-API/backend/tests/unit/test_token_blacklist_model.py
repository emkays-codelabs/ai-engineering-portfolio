import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy.exc import IntegrityError


def _make_user(db_session, email="bob@example.com"):
    from app.models.user import User

    new_user = User(email=email, hashed_password="h")
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    return new_user


def test_token_blacklist_records_jti_user_and_expiry(db_session):
    from app.models.token_blacklist import TokenBlacklist

    owner = _make_user(db_session)

    entry = TokenBlacklist(
        jti="some-jti-value",
        user_id=owner.id,
        token_type="refresh",
        expires_at=datetime.now(UTC) + timedelta(days=7),
    )
    db_session.add(entry)
    db_session.commit()
    db_session.refresh(entry)

    assert isinstance(entry.id, uuid.UUID)
    assert entry.blacklisted_at is not None
    assert entry.user_id == owner.id


def test_token_blacklist_jti_must_be_unique(db_session):
    from app.models.token_blacklist import TokenBlacklist

    owner = _make_user(db_session, email="carol@example.com")
    expiry = datetime.now(UTC) + timedelta(days=1)

    db_session.add(
        TokenBlacklist(jti="dup-jti", user_id=owner.id, token_type="refresh", expires_at=expiry)
    )
    db_session.commit()

    db_session.add(
        TokenBlacklist(jti="dup-jti", user_id=owner.id, token_type="refresh", expires_at=expiry)
    )
    with pytest.raises(IntegrityError):
        db_session.commit()
