import uuid

import pytest


def _user(role):
    from app.models.user import User

    return User(id=uuid.uuid4(), email="x@example.com", hashed_password="h", role=role)


def test_require_role_allows_a_user_with_the_required_role():
    from app.models.user import Role
    from app.services.authorization_service import require_role

    admin = _user(Role.ADMIN)

    require_role(admin, Role.ADMIN)  # must not raise


def test_require_role_allows_when_user_has_any_of_several_allowed_roles():
    from app.models.user import Role
    from app.services.authorization_service import require_role

    regular_user = _user(Role.USER)

    require_role(regular_user, Role.ADMIN, Role.USER)  # must not raise


def test_require_role_rejects_a_user_without_the_required_role():
    from app.exceptions.auth_exceptions import InsufficientRoleError
    from app.models.user import Role
    from app.services.authorization_service import require_role

    regular_user = _user(Role.USER)

    with pytest.raises(InsufficientRoleError):
        require_role(regular_user, Role.ADMIN)
