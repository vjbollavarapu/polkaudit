import asyncio
import sys
from sqlalchemy import text
from .config import Settings
from .database import engine

async def check_health():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("Database connection: OK")
        sys.exit(0)
    except Exception as e:
        print(f"Database connection: FAILED - {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(check_health())
