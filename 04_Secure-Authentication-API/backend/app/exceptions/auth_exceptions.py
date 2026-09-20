class EmailAlreadyRegisteredError(Exception):
    """Raised when registration is attempted with an email that already has an account."""

    def __init__(self, email: str):
        self.email = email
        super().__init__(f"Email already registered: {email}")


class InvalidCredentialsError(Exception):
    """Raised for a wrong password, an unknown email, or an inactive user.

    Deliberately one exception for all three cases — a distinguishable error would
    let an attacker enumerate which emails have accounts.
    """


class InsufficientRoleError(Exception):
    """Raised when an authenticated user lacks a role required for an action."""


class InvalidAccessTokenError(Exception):
    """Raised for a malformed/expired/wrong-typed access token, or one whose user
    is unknown or inactive — the bearer-token equivalent of InvalidRefreshTokenError.
    """


class InvalidRefreshTokenError(Exception):
    """Raised for a malformed/expired/wrong-typed refresh token, a replay of an
    already-rotated one, or a token whose user is unknown or inactive.

    Deliberately one exception for all cases, same rationale as
    InvalidCredentialsError — the caller only needs to know "reject this," not why.
    """
