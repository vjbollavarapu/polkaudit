from sqlalchemy import Column, Integer, String, BigInteger, JSON, ForeignKey
from src.database import Base

# Re-defining models here to allow backend service to be independent
# Ideally this would be shared code, but we minimize coupling for this step
class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    proposal_index = Column(Integer, index=True, nullable=True)
    external_id = Column(String, index=True, nullable=True)
    block_number = Column(BigInteger, index=True, nullable=False)
    section = Column(String, nullable=False)
    method = Column(String, nullable=False)
    proposer = Column(String, nullable=False)
    args = Column(JSON, nullable=True)
    status = Column(String, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    proposal_index = Column(Integer, index=True, nullable=False)
    block_number = Column(BigInteger, index=True, nullable=False)
    voter = Column(String, nullable=False)
    vote = Column(String, nullable=False) 
    balance = Column(String, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

class TreasurySpend(Base):
    __tablename__ = "treasury_spends"

    id = Column(Integer, primary_key=True, index=True)
    block_number = Column(BigInteger, index=True, nullable=False)
    beneficiary = Column(String, nullable=False)
    value = Column(String, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
