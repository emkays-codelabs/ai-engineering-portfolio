from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_admin_user, get_user_repository
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserRead])
def list_users(
    _admin: User = Depends(get_current_admin_user),
    user_repo: UserRepository = Depends(get_user_repository),
) -> list[UserRead]:
    return user_repo.list_all()
