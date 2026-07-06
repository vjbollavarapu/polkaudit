import pytest
from unittest.mock import AsyncMock, MagicMock

from src.scanner import FinalizedScanner


@pytest.mark.asyncio
async def test_scanner_processes_block():
    mock_session = MagicMock()

    scanner = FinalizedScanner(mock_session)
    scanner.parser = MagicMock()
    scanner.parser.parse_block.return_value = {
        "proposals": [],
        "votes": [],
        "treasury_spends": [],
        "extrinsics": [],
    }

    block_data = {
        "block": {
            "header": {"number": "0x64", "parentHash": "0xparent"},
            "extrinsics": [],
        }
    }

    scanner.session_maker = MagicMock()
    mock_db_session = AsyncMock()
    scanner.session_maker.return_value.__aenter__.return_value = mock_db_session
    mock_db_session.get.return_value = None

    await scanner.process_block(block_data, 100, "0xblockhash")

    scanner.parser.parse_block.assert_called_once_with(100, [])
    assert mock_db_session.add.called
    assert mock_db_session.commit.called
