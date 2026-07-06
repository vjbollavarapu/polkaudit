from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_db
from src.services.alert_service import AlertService
from pydantic import BaseModel
from src.models.alert import NotificationChannel, AlertRule, AlertHistory
from src.dependencies import RoleChecker, get_current_project

router = APIRouter()
allow_admin = RoleChecker(["admin"])

class ChannelCreate(BaseModel):
    name: str
    type: str
    config: dict

class RuleCreate(BaseModel):
    name: str
    rule_type: str
    condition: dict
    channel_id: int

@router.post("/channels", status_code=201, dependencies=[Depends(allow_admin)])
async def create_channel(channel: ChannelCreate, db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    service = AlertService(db)
    return await service.create_channel(channel.name, channel.type, channel.config, project_id)

@router.get("/channels", dependencies=[Depends(allow_admin)])
async def list_channels(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    result = await db.execute(select(NotificationChannel).where(NotificationChannel.project_id == project_id))
    return result.scalars().all()

@router.post("/rules", status_code=201, dependencies=[Depends(allow_admin)])
async def create_rule(rule: RuleCreate, db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    service = AlertService(db)
    return await service.create_rule(rule.name, rule.rule_type, rule.condition, rule.channel_id, project_id)

@router.get("/rules", dependencies=[Depends(allow_admin)])
async def list_rules(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    result = await db.execute(select(AlertRule).where(AlertRule.project_id == project_id))
    return result.scalars().all()

@router.get("/history", dependencies=[Depends(allow_admin)])
async def list_history(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    result = await db.execute(select(AlertHistory).where(AlertHistory.project_id == project_id).order_by(AlertHistory.created_at.desc()).limit(50))
    return result.scalars().all()

@router.post("/trigger", dependencies=[Depends(allow_admin)])
async def trigger_alerts(db: AsyncSession = Depends(get_db), project_id: int = Depends(get_current_project)):
    service = AlertService(db)
    await service.check_alerts(project_id)
    return {"status": "triggered"}
