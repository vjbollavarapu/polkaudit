from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.compliance import CompliancePolicy, ContractEvent, ComplianceViolation, PolicySeverity
from src.models.project import Project
from typing import Dict, Any, List
import structlog

logger = structlog.get_logger()

class ComplianceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_policy(self, project_id: int, name: str, rule_type: str, config: Dict[str, Any], severity: str = "warning"):
        policy = CompliancePolicy(
            project_id=project_id,
            name=name,
            rule_type=rule_type,
            config=config,
            severity=severity
        )
        self.db.add(policy)
        await self.db.commit()
        await self.db.refresh(policy)
        return policy

    async def ingest_event(self, project_id: int, event_type: str, block_number: int, details: Dict[str, Any]):
        # 1. Store Event
        event = ContractEvent(
            project_id=project_id,
            event_type=event_type,
            block_number=block_number,
            details=details
        )
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)

        # 2. Evaluate against Policies
        await self._evaluate_event(project_id, event)
        
        return event

    async def _evaluate_event(self, project_id: int, event: ContractEvent):
        # Fetch active policies for project
        result = await self.db.execute(select(CompliancePolicy).where(CompliancePolicy.project_id == project_id, CompliancePolicy.is_active == True))
        policies = result.scalars().all()

        for policy in policies:
            violation_details = None
            
            # Simple Rule Engine
            if policy.rule_type == "max_value":
                # Check numeric value in details
                key = policy.config.get("key", "value")
                limit = policy.config.get("limit", 0)
                event_val = event.details.get(key)
                
                if event_val is not None and float(event_val) > limit:
                     violation_details = f"Value {event_val} exceeds limit {limit}"

            elif policy.rule_type == "method_blacklist":
                 # Check method name
                 blacklist = policy.config.get("blacklist", [])
                 method = event.details.get("method")
                 if method in blacklist:
                     violation_details = f"Method {method} is blacklisted"

            # Create Violation if detected
            if violation_details:
                violation = ComplianceViolation(
                    project_id=project_id,
                    policy_id=policy.id,
                    event_id=event.id,
                    details=violation_details,
                    status="open"
                )
                self.db.add(violation)
                logger.warn("Compliance Violation Detected", policy=policy.name, details=violation_details)
        
        await self.db.commit()

    async def list_violations(self, project_id: int):
         result = await self.db.execute(select(ComplianceViolation).where(ComplianceViolation.project_id == project_id).order_by(ComplianceViolation.created_at.desc()))
         return result.scalars().all()
