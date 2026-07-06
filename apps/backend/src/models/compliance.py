from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.sql import func
from src.database import Base
import enum

class PolicySeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class CompliancePolicy(Base):
    __tablename__ = "compliance_policies"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    rule_type = Column(String, nullable=False) # e.g., "max_value", "whitelist_method"
    config = Column(JSON, nullable=False) # {max: 1000, methods: ["approve"]}
    severity = Column(String, default=PolicySeverity.WARNING)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ContractEvent(Base):
    __tablename__ = "contract_events"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    event_type = Column(String, nullable=False) # e.g., "ContractEmitted", "ExtrinsicSuccess"
    block_number = Column(Integer, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ComplianceViolation(Base):
    __tablename__ = "compliance_violations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    policy_id = Column(Integer, ForeignKey("compliance_policies.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("contract_events.id"), nullable=False)
    details = Column(String, nullable=False) # "Value 5000 > Max 1000"
    status = Column(String, default="open") # open, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
