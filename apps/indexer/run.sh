#!/usr/bin/env bash
# PolkAudit indexer — asyncio worker (NOT uvicorn/FastAPI)
set -euo pipefail
cd "$(dirname "$0")"

if [[ -d venv ]]; then
  source venv/bin/activate
elif [[ -d .venv ]]; then
  source .venv/bin/activate
else
  echo "Create a venv first: python3 -m venv venv && source venv/bin/activate"
  echo "Then: pip install -r requirements.txt"
  exit 1
fi

if ! python -c "from substrateinterface import SubstrateInterface; assert hasattr(SubstrateInterface, 'decode_scale')" 2>/dev/null; then
  echo "ERROR: Wrong substrate package. Run:"
  echo "  pip uninstall -y substrateinterface 2>/dev/null; pip install -r requirements.txt"
  exit 1
fi

export PYTHONPATH=.
exec python -m src.main
