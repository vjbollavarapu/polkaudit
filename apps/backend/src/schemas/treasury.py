from pydantic import BaseModel
from typing import Optional

class TreasurySpendResponse(BaseModel):
    id: int
    block_number: int
    beneficiary: str
    value: str

    class Config:
        from_attributes = True
