from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import Role, User
from app.repositories.token_repository import TokenRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.authorization_service import require_role
from app.services.token_service import TokenService

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_token_repository(db: Session = Depends(get_db)) -> TokenRepository:
    return TokenRepository(db)


def get_auth_service(user_repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(user_repo)


def get_token_service(
    user_repo: UserRepository = Depends(get_user_repository),
    token_repo: TokenRepository = Depends(get_token_repository),
) -> TokenService:
    return TokenService(user_repo, token_repo)


def get_current_user(
    token: str = Depends(_oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    return auth_service.get_current_user(token)


def get_current_admin_user(user: User = Depends(get_current_user)) -> User:
    require_role(user, Role.ADMIN)
    return user
