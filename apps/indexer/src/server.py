from aiohttp import web
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter, Gauge
from sqlalchemy import text
from .database import engine

# Prometheus Metrics
BLOCKS_PROCESSED = Counter("polkaudit_indexer_blocks_processed_total", "Total blocks processed")
BLOCKS_FAILED = Counter("polkaudit_indexer_blocks_failed_total", "Total blocks failed")
LAST_PROCESSED_BLOCK = Gauge("polkaudit_indexer_last_processed_block", "Last processed block number")

async def health_check(request):
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return web.json_response({"status": "healthy", "database": "connected"})
    except Exception as e:
        return web.json_response({"status": "unhealthy", "database": str(e)}, status=503)

async def metrics(request):
    data = generate_latest()
    return web.Response(body=data, content_type=CONTENT_TYPE_LATEST)

async def start_server(port=8000):
    app = web.Application()
    app.router.add_get("/health", health_check)
    app.router.add_get("/metrics", metrics)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    return runner
