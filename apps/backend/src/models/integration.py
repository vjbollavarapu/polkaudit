from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from src.database import Base

class Plugin(Base):
    __tablename__ = "plugins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True) # e.g., "Discord", "Slack"
    slug = Column(String, nullable=False, unique=True, index=True) # e.g., "discord", "slack"
    description = Column(String, nullable=True)
    capabilities = Column(JSON, nullable=False) # ["notify", "sync"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    plugin_id = Column(Integer, ForeignKey("plugins.id"), nullable=False)
    config = Column(JSON, nullable=True) # {webhook_url: "..."}
    credentials = Column(JSON, nullable=True) # {access_token: "..."} (In real world, encrypt this!)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
