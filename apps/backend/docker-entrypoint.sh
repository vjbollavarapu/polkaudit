#!/bin/sh
set -e
cd /app

PORT="${PORT:-8000}"

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting API on 0.0.0.0:${PORT}"
exec python -m uvicorn src.main:app --host 0.0.0.0 --port "${PORT}"
