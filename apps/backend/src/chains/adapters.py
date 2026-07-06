from src.chains.base import ChainAdapter
from typing import List, Dict, Any

class EthereumAdapter(ChainAdapter):
    """
    Mock Adapter for Ethereum GovernorBravo
    """
    async def fetch_proposals(self) -> List[Dict[str, Any]]:
        # Simulating web3.eth.Contract.events.ProposalCreated
        return [
            {
                "external_id": "0x123...abc",
                "title": "Uniswap V3 Deployment",
                "proposer": "0xProposerAddress",
                "status": "Active",
                "block_number": 18000000
            }
        ]

    async def get_governance_metrics(self) -> Dict[str, Any]:
        return {"quorum": "4%", "timelock": "2 days"}

class CosmosAdapter(ChainAdapter):
    """
    Mock Adapter for Cosmos SDK Gov v1
    """
    async def fetch_proposals(self) -> List[Dict[str, Any]]:
        # Simulating gRPC /cosmos.gov.v1.Query/Proposals
        return [
            {
                "external_id": "142",
                "title": "Community Pool Spend",
                "proposer": "cosmos1...",
                "status": "PROPOSAL_STATUS_VOTING_PERIOD",
                "block_number": 12000000
            }
        ]
    
    async def get_governance_metrics(self) -> Dict[str, Any]:
        return {"bonded_tokens": "150M", "apr": "14%"}

class SolanaAdapter(ChainAdapter):
    """
    Mock Adapter for SPL Governance
    """
    async def fetch_proposals(self) -> List[Dict[str, Any]]:
        # Simulating getProgramAccounts
        return [
            {
                "external_id": "Pubkey123...",
                "title": "Grant for Ecosystem Dev",
                "proposer": "Soluser1...",
                "status": "Voting",
                "block_number": 210000000
            }
        ]

    async def get_governance_metrics(self) -> Dict[str, Any]:
        return {"total_realms": 50}
