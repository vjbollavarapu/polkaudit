from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_db
from src.services.integration_service import IntegrationService
from src.dependencies import RoleChecker, get_current_project
from src.ai.service import AIService, AnalysisRequest
from src.models.ai import AIRecommendation
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
allow_auditor = RoleChecker(["admin", "auditor"])

class FeedbackRequest(BaseModel):
    status: str # approved, rejected
    notes: Optional[str] = None

from fastapi import BackgroundTasks
from src.database import async_session

async def run_ai_analysis(project_id: int, request: AnalysisRequest):
    async with async_session() as db:
        service = AIService(db)
        await service.analyze_proposal(project_id, request)

@router.post("/analyze/proposal", status_code=202, dependencies=[Depends(allow_auditor)])
async def analyze_proposal(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    project_id: int = Depends(get_current_project)
):
    background_tasks.add_task(run_ai_analysis, project_id, request)
    return {"status": "queued", "message": "AI analysis started in background"}

@router.get("/recommendations", dependencies=[Depends(allow_auditor)])
async def list_recommendations(
    db: AsyncSession = Depends(get_db), 
    project_id: int = Depends(get_current_project)
):
    result = await db.execute(select(AIRecommendation).where(AIRecommendation.project_id == project_id).order_by(AIRecommendation.created_at.desc()))
    return result.scalars().all()

@router.post("/recommendations/{rec_id}/feedback", dependencies=[Depends(allow_auditor)])
async def update_feedback(
    rec_id: int,
    feedback: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = AIService(db)
    try:
        rec = await service.update_feedback(rec_id, feedback.status, feedback.notes)
        return rec
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
