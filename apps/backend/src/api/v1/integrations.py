from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_db
from src.services.integration_service import IntegrationService
from src.dependencies import RoleChecker, get_current_project
from src.models.integration import Plugin
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter()
allow_admin = RoleChecker(["admin"])

class IntegrationConfig(BaseModel):
    plugin_slug: str
    config: Dict[str, Any]

class PluginResponse(BaseModel):
    name: str
    slug: str
    description: str

@router.get("/plugins", response_model=List[PluginResponse], dependencies=[Depends(allow_admin)])
async def list_plugins(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plugin))
    return result.scalars().all()

@router.post("/configure", dependencies=[Depends(allow_admin)])
async def configure_integration(
    config: IntegrationConfig,
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = IntegrationService(db)
    try:
        await service.configure_integration(project_id, config.plugin_slug, config.config)
        return {"status": "configured"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/test-dispatch", dependencies=[Depends(allow_admin)])
async def test_dispatch(
    message: str,
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = IntegrationService(db)
    await service.dispatch_notify(project_id, message)
    return {"status": "dispatched"}
