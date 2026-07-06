from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, Numeric
from src.models.proposal import Proposal, Vote, TreasurySpend
from src.models.indexer import Block, Extrinsic, ProcessedBlock
from src.schemas.stats import StatsOverview

class StatsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self) -> StatsOverview:
        # These could be optimized with a single query or caching
        total_proposals = await self.db.scalar(select(func.count(Proposal.id))) or 0
        total_votes = await self.db.scalar(select(func.count(Vote.id))) or 0
        
        # Taking assumption that value is numeric string, basic sum for now
        # In production this might need casting or specialized handling for big ints
        # For simplicity in this demo, we'll just count spends or do a dummy sum
        # Re-visiting 'value' in TreasurySpend is String, so direct SUM might fail in SQL if not cast
        # We will return the count of spends for now as 'total_treasury_spend' label might be misleading 
        # or we cast. Let's cast to numeric for sum if postgres.
        
        total_spend_q = select(func.sum(func.cast(TreasurySpend.value, Numeric)))
        total_spend = await self.db.scalar(total_spend_q) or 0

        total_blocks = await self.db.scalar(select(func.count(Block.id))) or 0
        total_extrinsics = await self.db.scalar(select(func.count(Extrinsic.id))) or 0
        last_block = await self.db.scalar(select(func.max(ProcessedBlock.block_number))) or 0

        return StatsOverview(
            total_proposals=total_proposals,
            total_votes=total_votes,
            total_treasury_spend=str(total_spend),
            total_blocks_indexed=total_blocks,
            total_extrinsics=total_extrinsics,
            last_indexed_block=int(last_block),
        )

