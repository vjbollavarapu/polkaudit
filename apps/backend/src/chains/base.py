from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class ChainAdapter(ABC):
    def __init__(self, rpc_url: str):
        self.rpc_url = rpc_url

    @abstractmethod
    async def fetch_proposals(self) -> List[Dict[str, Any]]:
        """
        Fetch active proposals from the chain.
        Returns a list of dicts normalized to:
        {
            "external_id": str,
            "title": str, # Mapped to section/method or args
            "proposer": str,
            "status": str,
            "block_number": int
        }
        """
        pass

    @abstractmethod
    async def get_governance_metrics(self) -> Dict[str, Any]:
        """
        Fetch high-level metrics (e.g. participation rate).
        """
        pass
