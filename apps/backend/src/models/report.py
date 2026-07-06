import uuid
from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from src.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., 'monthly', 'quarterly'
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    risk_score = Column(Float, default=0.0)
    summary_data = Column(JSON, nullable=True)
    file_hash = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
