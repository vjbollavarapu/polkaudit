from sqlalchemy import Column, Integer, String, BigInteger, JSON, DateTime
from sqlalchemy.sql import func
from src.database import Base


class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(BigInteger, unique=True, index=True, nullable=False)
    block_hash = Column(String, nullable=False)
    parent_hash = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    events_count = Column(Integer, default=0)
    extrinsics_count = Column(Integer, default=0)


class Extrinsic(Base):
    __tablename__ = "extrinsics"

    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(BigInteger, index=True, nullable=False)
    extrinsic_hash = Column(String, index=True, nullable=False)
    module = Column(String, nullable=False)
    call = Column(String, nullable=False)
    signer = Column(String, nullable=True)
    args = Column(JSON, nullable=True)
    success = Column(String, nullable=False)


class ProcessedBlock(Base):
    __tablename__ = "processed_blocks"

    block_number = Column(BigInteger, primary_key=True, index=True)
    block_hash = Column(String, nullable=False)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
