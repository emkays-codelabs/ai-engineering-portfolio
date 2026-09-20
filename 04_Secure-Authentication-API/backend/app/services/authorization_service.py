from app.exceptions.auth_exceptions import InsufficientRoleError
from app.models.user import Role, User


def require_role(user: User, *allowed_roles: Role) -> None:
    """Re-verifies the user's role from the current DB row (via `user`), never
    trusting a client-supplied claim in isolation — see docs/HLD.md Section 7.
    """
    if user.role not in allowed_roles:
        raise InsufficientRoleError()
