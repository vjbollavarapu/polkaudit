from sqlalchemy.ext.asyncio import AsyncSession
from src.models.ai import AIRecommendation, AIRecommendationStatus
from src.ai.provider import MockLLMProvider
from pydantic import BaseModel
import structlog

logger = structlog.get_logger()

class AnalysisRequest(BaseModel):
    proposal_id: str
    title: str
    description: str
    value: float

class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.provider = MockLLMProvider()

    async def analyze_proposal(self, project_id: int, request: AnalysisRequest):
        logger.info("Analyzing proposal", proposal_id=request.proposal_id)

        # 1. Construct Prompt (Simulated)
        prompt_content = f"Title: {request.title}\nDescription: {request.description}\nValue: {'High' if request.value > 10000 else 'Low'}"
        
        # 2. Call LLM
        result = await self.provider.analyze("System Prompt: You are a risk auditor.", prompt_content)
        
        # 3. Store Recommendation
        rec = AIRecommendation(
            project_id=project_id,
            target_type="proposal",
            target_id=request.proposal_id,
            recommendation_text=result["recommendation"],
            risk_score=result["risk_score"],
            explanation=result["explanation"],
            status=AIRecommendationStatus.PENDING,
            audit_log={"model": "mock-llm", "version": "0.1"}
        )
        self.db.add(rec)
        await self.db.commit()
        await self.db.refresh(rec)
        return rec
    
    async def update_feedback(self, recommendation_id: int, status: str, notes: str):
        rec = await self.db.get(AIRecommendation, recommendation_id)
        if not rec:
            raise ValueError("Recommendation not found")
        
        rec.status = status
        rec.feedback_notes = notes
        await self.db.commit()
        await self.db.refresh(rec)
        return rec
