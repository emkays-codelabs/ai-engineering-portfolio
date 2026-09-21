import uuid

import pytest


def _build_service(db_session):
    from app.repositories.token_repository import TokenRepository
    from app.repositories.user_repository import UserRepository
    from app.services.token_service import TokenService

    return TokenService(UserRepository(db_session), TokenRepository(db_session))


def _register_user(db_session, email="alice@example.com"):
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    return AuthService(UserRepository(db_session)).register(email=email, password="a-password")


def test_issue_tokens_returns_matching_access_and_refresh_tokens_for_the_user(db_session):
    from app.core.security import decode_token

    service = _build_service(db_session)
    user = _register_user(db_session)

    access_token, refresh_token, refresh_jti = service.issue_tokens(user)

    access_payload = decode_token(access_token)
    assert access_payload["sub"] == str(user.id)
    assert access_payload["role"] == "user"
    assert access_payload["type"] == "access"

    refresh_payload = decode_token(refresh_token)
    assert refresh_payload["sub"] == str(user.id)
    assert refresh_payload["type"] == "refresh"
    assert refresh_payload["jti"] == refresh_jti


def test_refresh_issues_new_tokens_and_blacklists_the_old_one(db_session):
    from app.core.security import decode_token
    from app.repositories.token_repository import TokenRepository

    service = _build_service(db_session)
    user = _register_user(db_session)
    _access, old_refresh, old_jti = service.issue_tokens(user)

    new_access, new_refresh, new_jti = service.refresh(old_refresh)

    assert new_jti != old_jti
    assert decode_token(new_access)["sub"] == str(user.id)
    assert decode_token(new_refresh)["jti"] == new_jti
    assert TokenRepository(db_session).is_blacklisted(old_jti) is True


def test_refresh_rejects_a_reused_already_rotated_token(db_session):
    from app.exceptions.auth_exceptions import InvalidRefreshTokenError

    service = _build_service(db_session)
    user = _register_user(db_session)
    _access, old_refresh, _old_jti = service.issue_tokens(user)

    service.refresh(old_refresh)  # first rotation succeeds, blacklists old_refresh's jti

    with pytest.raises(InvalidRefreshTokenError):
        service.refresh(old_refresh)  # replay of the now-revoked token


def test_refresh_rejects_an_access_token_presented_as_refresh(db_session):
    from app.exceptions.auth_exceptions import InvalidRefreshTokenError

    service = _build_service(db_session)
    user = _register_user(db_session)
    access_token, _refresh, _jti = service.issue_tokens(user)

    with pytest.raises(InvalidRefreshTokenError):
        service.refresh(access_token)


def test_refresh_rejects_a_malformed_token(db_session):
    from app.exceptions.auth_exceptions import InvalidRefreshTokenError

    service = _build_service(db_session)

    with pytest.raises(InvalidRefreshTokenError):
        service.refresh("not-a-real-jwt")


def test_refresh_rejects_when_the_user_is_no_longer_active(db_session):
    from app.exceptions.auth_exceptions import InvalidRefreshTokenError
    from app.repositories.user_repository import UserRepository

    service = _build_service(db_session)
    user = _register_user(db_session)
    _access, refresh_token, _jti = service.issue_tokens(user)

    user_repo = UserRepository(db_session)
    stored = user_repo.get_by_id(user.id)
    stored.is_active = False
    db_session.commit()

    with pytest.raises(InvalidRefreshTokenError):
        service.refresh(refresh_token)


def test_logout_blacklists_the_refresh_token_jti(db_session):
    from app.repositories.token_repository import TokenRepository

    service = _build_service(db_session)
    user = _register_user(db_session)
    _access, refresh_token, jti = service.issue_tokens(user)

    service.logout(refresh_token)

    assert TokenRepository(db_session).is_blacklisted(jti) is True


def test_logout_with_no_token_does_not_raise(db_session):
    service = _build_service(db_session)

    service.logout(None)  # must not raise


def test_logout_with_a_malformed_token_does_not_raise(db_session):
    service = _build_service(db_session)

    service.logout("not-a-real-jwt")  # must not raise


def test_logout_with_an_access_token_does_not_blacklist_anything(db_session):
    from app.repositories.token_repository import TokenRepository

    service = _build_service(db_session)
    user = _register_user(db_session)
    access_token, _refresh, _jti = service.issue_tokens(user)

    service.logout(access_token)  # wrong type — silently ignored, must not raise

    from app.core.security import decode_token

    access_jti = decode_token(access_token)["jti"]
    assert TokenRepository(db_session).is_blacklisted(access_jti) is False


def test_logout_is_idempotent_when_called_twice(db_session):
    service = _build_service(db_session)
    user = _register_user(db_session)
    _access, refresh_token, _jti = service.issue_tokens(user)

    service.logout(refresh_token)
    service.logout(refresh_token)  # second call must not raise or double-insert


def test_refresh_rejects_gracefully_on_a_concurrent_redemption_race(db_session):
    """Simulates two requests racing to redeem the same refresh token: both pass
    is_blacklisted() (stale read), but the DB's unique constraint means only one
    insert can win. The loser must get a clean InvalidRefreshTokenError, not an
    unhandled IntegrityError bubbling up as a 500.
    """
    from sqlalchemy.exc import IntegrityError

    from app.exceptions.auth_exceptions import InvalidRefreshTokenError
    from app.repositories.user_repository import UserRepository
    from app.services.token_service import TokenService

    class _RacingTokenRepo:
        def is_blacklisted(self, jti):
            return False  # stale read — hasn't seen the winner's insert yet

        def blacklist(self, **kwargs):
            raise IntegrityError("INSERT", {}, Exception("UNIQUE constraint failed"))

    user = _register_user(db_session)
    _access, refresh_token, _jti = _build_service(db_session).issue_tokens(user)

    racing_service = TokenService(UserRepository(db_session), _RacingTokenRepo())

    with pytest.raises(InvalidRefreshTokenError):
        racing_service.refresh(refresh_token)


def test_refresh_rejects_an_unknown_user(db_session):
    from app.core.security import create_refresh_token
    from app.exceptions.auth_exceptions import InvalidRefreshTokenError

    service = _build_service(db_session)
    orphan_token, _jti = create_refresh_token(user_id=uuid.uuid4())

    with pytest.raises(InvalidRefreshTokenError):
        service.refresh(orphan_token)
