import pytest


def test_register_creates_a_new_user_with_a_hashed_password(db_session):
    from app.core.security import verify_password
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))

    created = service.register(email="alice@example.com", password="a-plain-password")

    assert created.email == "alice@example.com"
    assert created.hashed_password != "a-plain-password"
    assert verify_password("a-plain-password", created.hashed_password) is True


def test_register_rejects_an_already_registered_email(db_session):
    from app.exceptions.auth_exceptions import EmailAlreadyRegisteredError
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))
    service.register(email="dup@example.com", password="first-password")

    with pytest.raises(EmailAlreadyRegisteredError):
        service.register(email="dup@example.com", password="second-password")


def test_authenticate_returns_the_user_for_correct_credentials(db_session):
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))
    service.register(email="alice@example.com", password="correct-password")

    authenticated = service.authenticate(email="alice@example.com", password="correct-password")

    assert authenticated.email == "alice@example.com"


def test_authenticate_rejects_a_wrong_password(db_session):
    from app.exceptions.auth_exceptions import InvalidCredentialsError
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))
    service.register(email="alice@example.com", password="correct-password")

    with pytest.raises(InvalidCredentialsError):
        service.authenticate(email="alice@example.com", password="wrong-password")


def test_authenticate_rejects_an_unknown_email(db_session):
    from app.exceptions.auth_exceptions import InvalidCredentialsError
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))

    with pytest.raises(InvalidCredentialsError):
        service.authenticate(email="nobody@example.com", password="whatever")


def test_get_current_user_returns_the_user_for_a_valid_access_token(db_session):
    from app.core.security import create_access_token
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))
    registered = service.register(email="alice@example.com", password="a-password")

    access_token = create_access_token(user_id=registered.id, role=registered.role.value)
    resolved = service.get_current_user(access_token)

    assert resolved.id == registered.id


def test_get_current_user_rejects_a_refresh_token_presented_as_access(db_session):
    from app.core.security import create_refresh_token
    from app.exceptions.auth_exceptions import InvalidAccessTokenError
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))
    registered = service.register(email="alice@example.com", password="a-password")
    refresh_token, _jti = create_refresh_token(user_id=registered.id)

    with pytest.raises(InvalidAccessTokenError):
        service.get_current_user(refresh_token)


def test_get_current_user_rejects_a_malformed_token(db_session):
    from app.exceptions.auth_exceptions import InvalidAccessTokenError
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    service = AuthService(UserRepository(db_session))

    with pytest.raises(InvalidAccessTokenError):
        service.get_current_user("not-a-real-jwt")


def test_get_current_user_rejects_an_inactive_user(db_session):
    from app.core.security import create_access_token
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    repo = UserRepository(db_session)
    service = AuthService(repo)
    registered = service.register(email="alice@example.com", password="a-password")
    access_token = create_access_token(user_id=registered.id, role=registered.role.value)

    stored = repo.get_by_id(registered.id)
    stored.is_active = False
    db_session.commit()

    from app.exceptions.auth_exceptions import InvalidAccessTokenError

    with pytest.raises(InvalidAccessTokenError):
        service.get_current_user(access_token)


def test_authenticate_rejects_an_inactive_user(db_session):
    from app.exceptions.auth_exceptions import InvalidCredentialsError
    from app.repositories.user_repository import UserRepository
    from app.services.auth_service import AuthService

    repo = UserRepository(db_session)
    service = AuthService(repo)
    service.register(email="alice@example.com", password="correct-password")

    user = repo.get_by_email("alice@example.com")
    user.is_active = False
    db_session.commit()

    with pytest.raises(InvalidCredentialsError):
        service.authenticate(email="alice@example.com", password="correct-password")
