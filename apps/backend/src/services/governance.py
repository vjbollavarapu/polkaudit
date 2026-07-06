from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from src.models.proposal import Proposal
from src.schemas.proposal import ProposalResponse

class GovernanceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_proposals(self, skip: int = 0, limit: int = 100, proposer: Optional[str] = None) -> List[Proposal]:
        query = select(Proposal)
        if proposer:
            query = query.where(Proposal.proposer == proposer)
        
        query = query.order_by(Proposal.proposal_index.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_proposal(self, proposal_index: int) -> Optional[Proposal]:
        query = select(Proposal).where(Proposal.proposal_index == proposal_index)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    # Placeholder for activity stats 
    # Real implementation would require grouping by date (derived from block number or timestamp if stored)
    # Since we only have block_number, let's skip complex date grouping for this iteration
    # or assume we have a way to map blocks to dates (not currently implemented)
