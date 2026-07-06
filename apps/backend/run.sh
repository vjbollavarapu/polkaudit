#!/usr/bin/env bash
# PolkAudit FastAPI backend — always uses this folder's venv (not system uvicorn)
set -euo pipefail
cd "$(dirname "$0")"

if [[ -x venv/bin/python ]]; then
  PYTHON="venv/bin/python"
elif [[ -x .venv/bin/python ]]; then
  PYTHON=".venv/bin/python"
else
  echo "No venv found. Run:"
  echo "  python3 -m venv venv"
  echo "  venv/bin/pip install -r requirements.txt"
  exit 1
fi

if ! "$PYTHON" -c "import asgi_correlation_id" 2>/dev/null; then
  echo "Installing dependencies into venv..."
  "$PYTHON" -m pip install -r requirements.txt
fi

export PYTHONPATH=.
# Use venv python only; do not watch venv/ (causes reload loops + system Python errors)
exec "$PYTHON" -m uvicorn src.main:app \
  --reload \
  --reload-dir src \
  --reload-exclude 'venv' \
  --reload-exclude '.venv' \
  --host 127.0.0.1 \
  --port 8000
