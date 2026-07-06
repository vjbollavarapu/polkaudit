from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, UUID4

class ReportCreate(BaseModel):
    title: str
    type: str # 'monthly', 'quarterly', 'adhoc'
    period_start: datetime
    period_end: datetime

class ReportResponse(BaseModel):
    id: int
    report_id: UUID4
    title: str
    type: str
    period_start: datetime
    period_end: datetime
    generated_at: datetime
    risk_score: float
    summary_data: Optional[Any] = None
    file_hash: str
    
    class Config:
        from_attributes = True
