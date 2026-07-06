import pytest
from unittest.mock import AsyncMock, MagicMock
from src.services.stats import StatsService

@pytest.mark.asyncio
async def test_stats_overview():
    # Mock DB session
    mock_db = AsyncMock()
    mock_db.scalar.side_effect = [10, 5, 1000, 200, 400, 31387000]  # proposals, votes, spend, blocks, extrinsics, last_block
    
    service = StatsService(mock_db)
    overview = await service.get_overview()
    
    assert overview.total_proposals == 10
    assert overview.total_votes == 5
    assert overview.total_treasury_spend == "1000"
    assert overview.total_blocks_indexed == 200
    assert overview.total_extrinsics == 400
    assert overview.last_indexed_block == 31387000
    
