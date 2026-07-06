from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from src.database import Base
import enum

class MetricType(str, enum.Enum):
    TRANSPARENCY = "transparency"
    PARTICIPATION = "participation"
    TREASURY = "treasury"
    OVERALL = "overall"

class AnalyticsMetric(Base):
    __tablename__ = "analytics_metrics"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    metric_type = Column(String, nullable=False) # Enum: MetricType
    date = Column(Date, nullable=False, index=True)
    value = Column(Float, nullable=False)
    
class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    metric_type = Column(String, nullable=False) # Enum: MetricType
    forecast_date = Column(Date, nullable=False)
    predicted_value = Column(Float, nullable=False)
    confidence_lower = Column(Float, nullable=True)
    confidence_upper = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
