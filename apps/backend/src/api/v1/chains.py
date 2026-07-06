from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.dependencies import RoleChecker, get_current_project
from src.chains.service import MultiChainService
from pydantic import BaseModel

router = APIRouter()
allow_admin = RoleChecker(["admin", "auditor"])

from fastapi import BackgroundTasks
from src.database import async_session
import structlog

logger = structlog.get_logger()

async def run_chain_sync(target_project_id: int):
    async with async_session() as db:
        service = MultiChainService(db)
        try:
            count = await service.sync_project_proposals(target_project_id)
            logger.info("Background sync completed", count=count)
        except Exception as e:
            logger.error("Background sync failed", error=str(e))

@router.post("/sync/{target_project_id}", status_code=202, dependencies=[Depends(allow_admin)])
async def sync_chain(
    target_project_id: int,
    background_tasks: BackgroundTasks
):
    """
    Trigger manual sync for a specific project in background.
    """
    background_tasks.add_task(run_chain_sync, target_project_id)
    return {"status": "queued", "message": "Chain sync started in background"}
