from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.services.analytics_service import AnalyticsService
from src.dependencies import RoleChecker, get_current_project
from pydantic import BaseModel
from datetime import date
from typing import List

router = APIRouter()
allow_admin = RoleChecker(["admin"])

class MetricResponse(BaseModel):
    date: date
    value: float

class ForecastResponse(BaseModel):
    forecast_date: date
    predicted_value: float
    confidence_lower: float
    confidence_upper: float

@router.post("/generate", dependencies=[Depends(allow_admin)])
async def generate_analytics(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    service = AnalyticsService(db)
    await service.aggregate_metrics(project_id)
    await service.generate_forecast(project_id)
    return {"status": "generated"}

@router.get("/trends", response_model=List[MetricResponse])
async def get_trends(
    metric_type: str = Query(..., description="transparency, participation, treasury, overall"),
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = AnalyticsService(db)
    return await service.get_trends(project_id, metric_type)

@router.get("/forecast", response_model=List[ForecastResponse])
async def get_forecast(
    metric_type: str = Query(..., description="transparency, participation, treasury, overall"),
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = AnalyticsService(db)
    return await service.get_forecasts(project_id, metric_type)
