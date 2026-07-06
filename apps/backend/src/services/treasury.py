from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from src.models.proposal import TreasurySpend
from src.schemas.treasury import TreasurySpendResponse

class TreasuryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_spends(self, skip: int = 0, limit: int = 100) -> List[TreasurySpend]:
        query = select(TreasurySpend).offset(skip).limit(limit).order_by(TreasurySpend.block_number.desc())
        result = await self.db.execute(query)
        return result.scalars().all()
