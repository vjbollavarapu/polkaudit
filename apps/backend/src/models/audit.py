from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from src.database import Base
import enum

class AuditCaseStatus(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    CLOSED = "closed"

class AuditCase(Base):
    __tablename__ = "audit_cases"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default=AuditCaseStatus.OPEN)
    assigned_auditor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditEvidence(Base):
    __tablename__ = "audit_evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("audit_cases.id"), nullable=False, index=True)
    description = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_hash = Column(String, nullable=False) # Immutable SHA256 mapping
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditComment(Base):
    __tablename__ = "audit_comments"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("audit_cases.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
