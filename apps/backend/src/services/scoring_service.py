from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.models.scoring import ScoreConfig, GovernanceScore
from src.models.project import Project
from src.models.proposal import Proposal, Vote, TreasurySpend
from src.models.report import Report
import structlog
import json

logger = structlog.get_logger()

class ScoringService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_config(self, project_id: int) -> ScoreConfig:
        result = await self.db.execute(select(ScoreConfig).where(ScoreConfig.project_id == project_id))
        config = result.scalars().first()
        if not config:
            config = ScoreConfig(
                project_id=project_id,
                weights={"transparency": 0.4, "participation": 0.3, "treasury": 0.3},
                thresholds={"min_turnout": 0.05}
            )
            self.db.add(config)
            await self.db.commit()
            await self.db.refresh(config)
        return config

    async def calculate_score(self, project_id: int) -> GovernanceScore:
        logger.info("Calculating score", project_id=project_id)
        config = await self.get_or_create_config(project_id)
        
        # 1. Transparency Score (Example: Ratio of Reports to Time or Fixed Check)
        # Simple Logic: If there is at least one report in last 30 days -> 100, else 50. 
        # For MVP: Count total reports. 5+ reports = 100, else proportional.
        reports_count = (await self.db.execute(select(func.count(Report.id)).where(Report.project_id == project_id))).scalar()
        transparency_score = min(reports_count * 20.0, 100.0)

        # 2. Participation Score
        # Logic: Avg voter turnout (or just raw vote count for MVP as we don't have total issuance readily in DB yet)
        # Let's use Avg votes per proposal
        # Get count of proposals and count of votes
        prop_count = (await self.db.execute(select(func.count(Proposal.id)).where(Proposal.project_id == project_id))).scalar()
        vote_count = (await self.db.execute(select(func.count(Vote.id)).where(Vote.project_id == project_id))).scalar()
        
        avg_votes = 0
        if prop_count > 0:
            avg_votes = vote_count / prop_count
        
        # Normalize: Assume 100 votes per proposal is "Good" (100 score)
        participation_score = min(avg_votes, 100.0)

        # 3. Treasury Risk Score
        # Logic: 100 - (High Value Spends Count * Penalty)
        # High value = > 1000 (just example)
        high_spends = (await self.db.execute(select(func.count(TreasurySpend.id)).where(
            TreasurySpend.project_id == project_id, 
            TreasurySpend.value > "1000" # String comparison alert! Assuming simplistic for now, ideally cast to int
        ))).scalar()
        
        treasury_score = max(100.0 - (high_spends * 10), 0.0)

        # 4. Overall Score
        weights = config.weights
        overall = (
            transparency_score * weights.get("transparency", 0) +
            participation_score * weights.get("participation", 0) +
            treasury_score * weights.get("treasury", 0)
        )

        # Store Score
        score = GovernanceScore(
            project_id=project_id,
            transparency_score=transparency_score,
            participation_score=participation_score,
            treasury_score=treasury_score,
            overall_score=overall,
            metadata_json={
                "reports_count": reports_count,
                "avg_votes": avg_votes,
                "high_spends": high_spends
            }
        )
        self.db.add(score)
        await self.db.commit()
        await self.db.refresh(score)
        
        logger.info("Score calculated", overall=overall)
        return score

    async def get_latest_score(self, project_id: int):
        result = await self.db.execute(select(GovernanceScore).where(GovernanceScore.project_id == project_id).order_by(GovernanceScore.created_at.desc()))
        return result.scalars().first()

    async def get_history(self, project_id: int):
        result = await self.db.execute(select(GovernanceScore).where(GovernanceScore.project_id == project_id).order_by(GovernanceScore.created_at.desc()).limit(30))
        return result.scalars().all()
