from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_db
from src.models.project import Project
from src.dependencies import RoleChecker
from pydantic import BaseModel

router = APIRouter()
allow_admin = RoleChecker(["admin"])

class ProjectCreate(BaseModel):
    name: str
    slug: str
    chain_id: str
    rpc_url: str

@router.get("/", dependencies=[Depends(allow_admin)])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project))
    return result.scalars().all()

@router.post("/", dependencies=[Depends(allow_admin)])
async def create_project(project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    new_project = Project(**project.model_dump())
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project
