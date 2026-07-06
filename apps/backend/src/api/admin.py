from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_db
from src.services.auth_service import AuthService
from src.schemas.user import UserCreate, UserResponse, UserRole
from src.dependencies import RoleChecker
from src.models.user import User

router = APIRouter()

allow_create = RoleChecker(["admin"])

@router.post("/users", response_model=UserResponse, dependencies=[Depends(allow_create)])
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    return await auth_service.create_user(user)

@router.get("/users", response_model=list[UserResponse], dependencies=[Depends(allow_create)])
async def list_users(db: AsyncSession = Depends(get_db)):
    # Simple list for now
    result = await db.execute(select(User))
    return result.scalars().all()
