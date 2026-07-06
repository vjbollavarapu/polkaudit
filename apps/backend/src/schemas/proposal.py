from pydantic import BaseModel
from typing import Optional, Any

class ProposalBase(BaseModel):
    proposal_index: int
    block_number: int
    section: str
    method: str
    proposer: str
    args: Optional[Any] = None
    status: Optional[str] = None

class ProposalCreate(ProposalBase):
    pass

class ProposalResponse(ProposalBase):
    id: int

    class Config:
        from_attributes = True
