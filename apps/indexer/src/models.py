from sqlalchemy import Column, Integer, String, DateTime, JSON, BigInteger
from sqlalchemy.sql import func
from .database import Base

class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(BigInteger, unique=True, index=True, nullable=False)
    block_hash = Column(String, unique=True, index=True, nullable=False)
    parent_hash = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    events_count = Column(Integer, default=0)
    extrinsics_count = Column(Integer, default=0)

class Extrinsic(Base):
    __tablename__ = "extrinsics"

    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(BigInteger, index=True, nullable=False)
    extrinsic_hash = Column(String, unique=False, index=True, nullable=False)
    module = Column(String, nullable=False)
    call = Column(String, nullable=False)
    signer = Column(String, nullable=True)
    args = Column(JSON, nullable=True)
    success = Column(String, nullable=False) # 'True' or 'False'

class ProcessedBlock(Base):
    __tablename__ = "processed_blocks"

    block_number = Column(BigInteger, primary_key=True, index=True)
    block_hash = Column(String, nullable=False)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    # Nullable after backend migration 0e753a03bb3d; indexer always sets a value
    proposal_index = Column(Integer, index=True, nullable=True)
    block_number = Column(BigInteger, index=True, nullable=False)
    section = Column(String, nullable=False)
    method = Column(String, nullable=False)
    proposer = Column(String, nullable=False)
    args = Column(JSON, nullable=True)
    status = Column(String, nullable=True)

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    proposal_index = Column(Integer, index=True, nullable=False)
    block_number = Column(BigInteger, index=True, nullable=False)
    voter = Column(String, nullable=False)
    vote = Column(String, nullable=False) # e.g., 'Aye', 'Nay'
    balance = Column(String, nullable=True)

class TreasurySpend(Base):
    __tablename__ = "treasury_spends"

    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(BigInteger, index=True, nullable=False)
    beneficiary = Column(String, nullable=False)
    value = Column(String, nullable=False)

class DeadLetterQueue(Base):
    __tablename__ = "dead_letter_queue"

    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(BigInteger, index=True, nullable=False)
    error_message = Column(String, nullable=False)
    retry_count = Column(Integer, default=0)
    last_attempt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


