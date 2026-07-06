from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.sql import func
from src.database import Base
import enum

class AIRecommendationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    target_type = Column(String, nullable=False) # proposal, budget, participation
    target_id = Column(String, nullable=True) # ID of the proposal or entity
    recommendation_text = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False) # 0-100
    explanation = Column(String, nullable=False)
    status = Column(String, default=AIRecommendationStatus.PENDING)
    feedback_notes = Column(String, nullable=True)
    audit_log = Column(JSON, nullable=True) # {model: "mock-gpt", prompt_version: "v1"}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
