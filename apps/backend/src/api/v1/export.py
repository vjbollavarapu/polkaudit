from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database import get_db
from src.auth import get_api_key
from src.models.proposal import Proposal
import csv
import io

router = APIRouter()

@router.get("/proposals/csv")
async def export_proposals_csv(
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    async def iter_csv():
        # Header
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "index", "block", "section", "method", "proposer", "status"])
        output.seek(0)
        yield output.read()

        # Data Stream
        # Use stream=True or yield_per for large datasets in real-world
        # For AsyncPG, we can use server-side cursors but for simplicity standard select
        result = await db.stream(select(Proposal))
        async for row in result:
             proposal = row.Proposal
             output = io.StringIO()
             writer = csv.writer(output)
             writer.writerow([
                 proposal.id, 
                 proposal.proposal_index, 
                 proposal.block_number, 
                 proposal.section, 
                 proposal.method, 
                 proposal.proposer,
                 proposal.status
             ])
             output.seek(0)
             yield output.read()

    return StreamingResponse(iter_csv(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=proposals.csv"})
