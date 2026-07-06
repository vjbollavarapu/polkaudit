#!/usr/bin/env bash
# Show governance-related row counts in the shared DB + optional API stats.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PY="${ROOT}/apps/indexer/venv/bin/python3"
[[ -x "$PY" ]] || PY="${ROOT}/apps/backend/venv/bin/python3"
[[ -x "$PY" ]] || PY="python3"

API_KEY="${API_KEY:-}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"

if [[ -f apps/backend/.env ]]; then
  # shellcheck disable=SC1091
  set -a && source apps/backend/.env && set +a
fi
API_KEY="${API_KEY:-dev-secret-key}"

echo "== PolkAudit governance data check =="
echo ""

"$PY" - <<'PY'
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path("scripts").resolve()))
from _governance_db import fetch_counts, load_indexer_env, print_counts

load_indexer_env()
counts = asyncio.run(fetch_counts())
print_counts(counts)
if counts["extrinsics"] > 0 and counts["proposals"] == 0:
    print()
    print("Note: extrinsics > 0 but proposals = 0 is normal for a short scan window.")
    print("      Run: make demo-backfill  (then restart the indexer)")
PY

echo ""
if curl -sf "$BACKEND_URL/health" >/dev/null 2>&1; then
  echo "API stats (requires API_KEY in apps/backend/.env or env):"
  if STATS=$(curl -sf -H "X-API-KEY: $API_KEY" "$BACKEND_URL/api/v1/stats/overview" 2>/dev/null); then
    echo "$STATS" | "$PY" -m json.tool
  else
    echo "  WARN: stats request failed — set API_KEY or BACKEND_URL"
  fi
else
  echo "API: backend not reachable at $BACKEND_URL (skip)"
fi
