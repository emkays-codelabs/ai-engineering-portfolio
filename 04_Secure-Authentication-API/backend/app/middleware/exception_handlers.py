from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.exceptions.auth_exceptions import (
    EmailAlreadyRegisteredError,
    InsufficientRoleError,
    InvalidAccessTokenError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
)


def _error_envelope(code: str, message: str) -> dict:
    return {"error": True, "code": code, "message": message, "details": {}}


async def _email_already_registered_handler(
    request: Request, exc: EmailAlreadyRegisteredError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=_error_envelope("EMAIL_ALREADY_REGISTERED", str(exc)),
    )


async def _invalid_credentials_handler(
    request: Request, exc: InvalidCredentialsError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content=_error_envelope("INVALID_CREDENTIALS", "Incorrect email or password"),
        headers={"WWW-Authenticate": "Bearer"},
    )


async def _invalid_refresh_token_handler(
    request: Request, exc: InvalidRefreshTokenError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content=_error_envelope("INVALID_REFRESH_TOKEN", "Invalid or expired refresh token"),
        headers={"WWW-Authenticate": "Bearer"},
    )


async def _invalid_access_token_handler(
    request: Request, exc: InvalidAccessTokenError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content=_error_envelope("INVALID_ACCESS_TOKEN", "Invalid or expired access token"),
        headers={"WWW-Authenticate": "Bearer"},
    )


async def _insufficient_role_handler(request: Request, exc: InsufficientRoleError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content=_error_envelope("INSUFFICIENT_ROLE", "You do not have access to this resource"),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Single place mapping domain exceptions to the project's error envelope.

    Routes raise/return typed exceptions; this is the only place that knows how to
    translate them to HTTP, per rules/02-architecture.md Rule 9.
    """
    app.add_exception_handler(EmailAlreadyRegisteredError, _email_already_registered_handler)
    app.add_exception_handler(InvalidCredentialsError, _invalid_credentials_handler)
    app.add_exception_handler(InvalidRefreshTokenError, _invalid_refresh_token_handler)
    app.add_exception_handler(InvalidAccessTokenError, _invalid_access_token_handler)
    app.add_exception_handler(InsufficientRoleError, _insufficient_role_handler)
