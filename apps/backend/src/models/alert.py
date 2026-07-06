from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.sql import func
from src.database import Base
import enum

class ChannelType(str, enum.Enum):
    EMAIL = "email"
    WEBHOOK = "webhook"
    TELEGRAM = "telegram"

class RuleType(str, enum.Enum):
    TREASURY_THRESHOLD = "treasury_threshold"
    PROPOSAL_STATUS_CHANGE = "proposal_status_change"

class AlertStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class NotificationChannel(Base):
    __tablename__ = "notification_channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # Enum: ChannelType
    config = Column(JSON, nullable=False) # {email: "", webhook_url: "", etc}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    rule_type = Column(String, nullable=False) # Enum: RuleType
    condition = Column(JSON, nullable=False) # {threshold: 1000, status: "Passed"}
    channel_id = Column(Integer, ForeignKey("notification_channels.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("alert_rules.id"), nullable=False)
    payload = Column(JSON, nullable=True) # Data that triggered the alert
    status = Column(String, default=AlertStatus.PENDING)
    retry_count = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
