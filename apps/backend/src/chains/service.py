from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.project import Project
from src.models.proposal import Proposal
from src.chains.adapters import EthereumAdapter, CosmosAdapter, SolanaAdapter
import structlog

logger = structlog.get_logger()

class MultiChainService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _get_adapter(self, chain_type: str, rpc_url: str):
        if chain_type == "ethereum":
            return EthereumAdapter(rpc_url)
        elif chain_type == "cosmos":
            return CosmosAdapter(rpc_url)
        elif chain_type == "solana":
            return SolanaAdapter(rpc_url)
        # Polkadot is handled by existing indexer logic, but could be adapted here too
        return None

    async def sync_project_proposals(self, project_id: int):
        project = await self.db.get(Project, project_id)
        if not project:
            raise ValueError("Project not found")

        adapter = self._get_adapter(project.chain_type, project.rpc_url)
        if not adapter:
            logger.info("No adapter for chain type", chain=project.chain_type)
            return 0

        logger.info("Syncing chain", chain=project.chain_type)
        raw_proposals = await adapter.fetch_proposals()
        
        count = 0
        for p in raw_proposals:
            # Check existing
            result = await self.db.execute(select(Proposal).where(Proposal.external_id == p["external_id"], Proposal.project_id == project.id))
            existing = result.scalars().first()
            
            if not existing:
                proposal = Proposal(
                    project_id=project.id,
                    external_id=p["external_id"],
                    # Mapping generic fields to existing schema
                    section="governance", 
                    method="proposal",
                    proposer=p["proposer"],
                    args={"title": p["title"]}, # Storing title in args for now
                    status=p["status"],
                    block_number=p["block_number"],
                    proposal_index=-1 # Sentinel for non-polkadot
                )
                self.db.add(proposal)
                count += 1
        
        await self.db.commit()
        return count
