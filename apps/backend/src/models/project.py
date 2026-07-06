from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.database import Base
from src.models.user import UserRole
import enum

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    chain_id = Column(String, nullable=True)
    rpc_url = Column(String, nullable=False)
    chain_type = Column(String, default="polkadot", nullable=False) # polkadot, ethereum, cosmos, solana
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserProject(Base):
    __tablename__ = "user_projects"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)
    role = Column(String, default="viewer", nullable=False) # admin, auditor, member, viewer
