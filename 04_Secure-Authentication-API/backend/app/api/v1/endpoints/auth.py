from fastapi import APIRouter, Cookie, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import settings
from app.core.dependencies import get_auth_service, get_token_service
from app.exceptions.auth_exceptions import InvalidRefreshTokenError
from app.schemas.token import TokenResponse
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import AuthService
from app.services.token_service import TokenService

router = APIRouter(prefix="/auth", tags=["auth"])

_REFRESH_COOKIE_NAME = "refresh_token"
_REFRESH_COOKIE_PATH = "/api/v1/auth"


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        # Secure requires HTTPS; only enforced outside local development so the
        # cookie still round-trips over plain http://localhost during the demo.
        secure=settings.environment != "development",
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path=_REFRESH_COOKIE_PATH,
    )


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserRead:
    return service.register(email=payload.email, password=payload.password)


@router.post("/login", response_model=TokenResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
    token_service: TokenService = Depends(get_token_service),
) -> TokenResponse:
    user = auth_service.authenticate(email=form_data.username, password=form_data.password)
    access_token, refresh_token, _jti = token_service.issue_tokens(user)

    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    token_service: TokenService = Depends(get_token_service),
) -> TokenResponse:
    if refresh_token is None:
        raise InvalidRefreshTokenError()

    access_token, new_refresh_token, _jti = token_service.refresh(refresh_token)

    _set_refresh_cookie(response, new_refresh_token)
    return TokenResponse(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    token_service: TokenService = Depends(get_token_service),
) -> None:
    token_service.logout(refresh_token)
    response.delete_cookie(key=_REFRESH_COOKIE_NAME, path=_REFRESH_COOKIE_PATH)
