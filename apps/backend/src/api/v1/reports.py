from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.services.report_service import ReportService
from src.schemas.report import ReportCreate, ReportResponse
import structlog
import os

logger = structlog.get_logger()
router = APIRouter()

@router.post("/", response_model=ReportResponse, status_code=201)
async def generate_report(
    report_in: ReportCreate,
    db: AsyncSession = Depends(get_db)
):
    service = ReportService(db)
    try:
        report = await service.generate_report(
            title=report_in.title,
            report_type=report_in.type,
            start=report_in.period_start,
            end=report_in.period_end
        )
        return report
    except Exception as e:
        logger.error("Failed to generate report", error=str(e))
        raise HTTPException(status_code=500, detail="Report generation failed")

@router.get("/", response_model=list[ReportResponse])
async def list_reports(db: AsyncSession = Depends(get_db)):
    service = ReportService(db)
    return await service.list_reports()

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    service = ReportService(db)
    report = await service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/{report_id}/download")
async def download_report(report_id: int, db: AsyncSession = Depends(get_db)):
    service = ReportService(db)
    report = await service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not os.path.exists(report.storage_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")
        
    return FileResponse(
        report.storage_path, 
        media_type="application/pdf", 
        filename=f"compliance_report_{report.report_id}.pdf"
    )
