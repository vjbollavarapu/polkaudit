import asyncio
import aiohttp
import json
from sqlalchemy.future import select
from .config import settings
from .logging_config import logger, configure_logging
from .database import engine, Base, async_session
from .models import Block
from .scanner import FinalizedScanner


configure_logging()

async def fetch_block(session, block_number):
    try:
        async with session.post(
            settings.SUBSTRATE_RPC_URL,
            json={
                "jsonrpc": "2.0",
                "method": "chain_getBlock",
                "params": [block_number],
                "id": 1
            }
        ) as response:
            return await response.json()
    except Exception as e:
        logger.error("Failed to fetch block", block_number=block_number, error=str(e))
        return None

async def verify_db():
    """Verify database connectivity. Schema is managed by backend Alembic migrations."""
    from sqlalchemy import text

    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    logger.info("Database connection verified")

import os
import signal
from .server import start_server

SHUTDOWN_SCANNER_TIMEOUT_SEC = 8.0


async def main():
    await verify_db()
    logger.info("Starting Indexer Service", rpc_url=settings.SUBSTRATE_RPC_URL)

    # Start Metrics Server
    runner = await start_server(port=settings.http_port)
    logger.info("Health/metrics server started", port=settings.http_port)

    scanner = FinalizedScanner(async_session)
    scanner_task = asyncio.create_task(scanner.run())

    loop = asyncio.get_running_loop()
    stop = asyncio.Event()
    signal_count = 0

    def _signal_handler():
        nonlocal signal_count
        signal_count += 1
        logger.info("Signal received, stopping...", count=signal_count)
        stop.set()
        scanner_task.cancel()
        if signal_count >= 2:
            logger.warning("Force exit (second interrupt)")
            os._exit(130)

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, _signal_handler)

    await stop.wait()

    logger.info("Shutting down...")
    try:
        await asyncio.wait_for(scanner_task, timeout=SHUTDOWN_SCANNER_TIMEOUT_SEC)
    except (asyncio.CancelledError, asyncio.TimeoutError):
        if not scanner_task.done():
            logger.warning(
                "Scanner did not stop in time (likely blocked on RPC/decode); exiting anyway"
            )

    await runner.cleanup()
    await engine.dispose()
    logger.info("Shutdown complete")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Indexer stop requested")
