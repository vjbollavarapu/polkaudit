from pydantic import BaseModel
from typing import List
from datetime import date

class StatsOverview(BaseModel):
    total_proposals: int
    total_votes: int
    total_treasury_spend: str  # Representing large numbers as strings or decimal
    total_blocks_indexed: int
    total_extrinsics: int
    last_indexed_block: int

class DailyActivity(BaseModel):
    date: date
    proposals_count: int
    votes_count: int

class GovernanceActivity(BaseModel):
    activity: List[DailyActivity]
