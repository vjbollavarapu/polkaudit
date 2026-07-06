from typing import Dict, Any

class MockLLMProvider:
    """
    Simulates an LLM for Proposal Analysis.
    In production, this would communicate with OpenAI/Anthropic.
    """
    async def analyze(self, system_prompt: str, user_content: str) -> Dict[str, Any]:
        """
        Returns a mock JSON response based on keywords in content.
        """
        content_lower = user_content.lower()
        
        # Risk Heuristics
        risk_score = 10
        explanation = "Proposal appears standard."
        recommendation = "Proceed with standard review."

        if "marketing" in content_lower:
            risk_score += 20
            explanation = "Marketing proposals often have vague ROIs."
        
        if "wallet" in content_lower or "transfer" in content_lower:
            risk_score += 30
            explanation += " Direct token transfers require extra scrutiny."

        # High Value Heuristic (simulated)
        if "value: high" in content_lower: 
             risk_score += 40
             explanation += " High requested value increases transparency requirements."

        return {
            "risk_score": min(95, risk_score),
            "explanation": explanation,
            "recommendation": recommendation if risk_score < 50 else "Request detailed budget breakdown and milestones."
        }
