from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from src.database import Base

class ScoreConfig(Base):
    __tablename__ = "score_configs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)
    weights = Column(JSON, nullable=False) # {transparency: 0.4, participation: 0.3, treasury: 0.3}
    thresholds = Column(JSON, nullable=True) # {min_turnout: 0.01}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class GovernanceScore(Base):
    __tablename__ = "governance_scores"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    score_date = Column(DateTime(timezone=True), server_default=func.now())
    transparency_score = Column(Float, nullable=False)
    participation_score = Column(Float, nullable=False)
    treasury_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    metadata_json = Column(JSON, nullable=True) # Store explainability data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
