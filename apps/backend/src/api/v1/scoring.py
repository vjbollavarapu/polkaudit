from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.services.scoring_service import ScoringService
from src.dependencies import RoleChecker, get_current_project
from pydantic import BaseModel

router = APIRouter()
allow_admin = RoleChecker(["admin"])

class ScoreResponse(BaseModel):
    id: int
    transparency_score: float
    participation_score: float
    treasury_score: float
    overall_score: float
    metadata_json: dict

@router.post("/calculate", response_model=ScoreResponse, dependencies=[Depends(allow_admin)])
async def calculate_score(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    service = ScoringService(db)
    return await service.calculate_score(project_id)

@router.get("/latest", response_model=ScoreResponse)
async def get_latest_score(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    service = ScoringService(db)
    score = await service.get_latest_score(project_id)
    if not score:
        raise HTTPException(status_code=404, detail="No score found")
    return score

@router.get("/history")
async def get_score_history(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    service = ScoringService(db)
    return await service.get_history(project_id)
