from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_db
from src.models.project import Project
from src.models.scoring import GovernanceScore
from src.models.analytics import AnalyticsMetric
from src.api.public.dependencies import limiter
from typing import List
from pydantic import BaseModel
from datetime import date

router = APIRouter()

class PublicProject(BaseModel):
    name: str
    slug: str
    chain_id: str

class PublicScore(BaseModel):
    transparency_score: float
    participation_score: float
    treasury_score: float
    overall_score: float
    score_date: date

@router.get("/projects/{slug}", response_model=PublicProject)
@limiter.limit("10/minute")
async def get_public_project(request: Request, slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.slug == slug, Project.is_public == True))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not public")
    return project

@router.get("/projects/{slug}/score", response_model=PublicScore)
@limiter.limit("10/minute")
async def get_public_project_score(request: Request, slug: str, db: AsyncSession = Depends(get_db)):
    # 1. Get Project ID
    p_result = await db.execute(select(Project).where(Project.slug == slug, Project.is_public == True))
    project = p_result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 2. Get Score
    s_result = await db.execute(
        select(GovernanceScore)
        .where(GovernanceScore.project_id == project.id)
        .order_by(GovernanceScore.created_at.desc())
    )
    score = s_result.scalars().first()
    if not score:
        raise HTTPException(status_code=404, detail="No score available")
    return score
