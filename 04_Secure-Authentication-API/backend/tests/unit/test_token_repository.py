from datetime import UTC, datetime, timedelta


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
