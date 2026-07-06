from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from src.dependencies import RoleChecker, get_current_project
from src.compliance.service import ComplianceService
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

router = APIRouter()
allow_admin = RoleChecker(["admin", "auditor"])

class PolicyCreate(BaseModel):
    name: str
    rule_type: str
    config: Dict[str, Any]
    severity: Optional[str] = "warning"

class EventIngest(BaseModel):
    event_type: str
    block_number: int
    details: Dict[str, Any]

@router.post("/policies", dependencies=[Depends(allow_admin)])
async def create_policy(
    policy: PolicyCreate,
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = ComplianceService(db)
    return await service.create_policy(project_id, policy.name, policy.rule_type, policy.config, policy.severity)

@router.post("/events", dependencies=[Depends(allow_admin)])
async def ingest_event(
    event: EventIngest,
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = ComplianceService(db)
    # Return full event + any triggered violations could be added here, but simple ingest for now
    created_event = await service.ingest_event(project_id, event.event_type, event.block_number, event.details)
    return {"status": "ingested", "event_id": created_event.id}

@router.get("/violations", dependencies=[Depends(allow_admin)])
async def list_violations(
    db: AsyncSession = Depends(get_db),
    project_id: int = Depends(get_current_project)
):
    service = ComplianceService(db)
    return await service.list_violations(project_id)
