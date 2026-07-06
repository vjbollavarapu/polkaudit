#!/usr/bin/env bash
# Reset indexer tables and configure a wider historical scan for governance demo data.
#
# Usage:
#   ./scripts/demo-backfill.sh              # interactive confirm
#   ./scripts/demo-backfill.sh --yes        # non-interactive
#   DEMO_START_BLOCK=31370000 ./scripts/demo-backfill.sh --yes --apply-env
#
# After running: restart the indexer (cd apps/indexer && ./run.sh)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PY="${ROOT}/apps/indexer/venv/bin/python3"
[[ -x "$PY" ]] || PY="${ROOT}/apps/backend/venv/bin/python3"
[[ -x "$PY" ]] || PY="python3"

INDEXER_ENV="${ROOT}/apps/indexer/.env"
YES=0
APPLY_ENV=0

# ~20k blocks of history from a recent era (adjust via env). Polkadot has ongoing OpenGov votes
# over this span; exact counts depend on parser coverage and RPC speed.
DEMO_START_BLOCK="${DEMO_START_BLOCK:-31370000}"
DEMO_CATCHUP_WINDOW="${DEMO_CATCHUP_WINDOW:-25000}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes) YES=1 ;;
    --apply-env) APPLY_ENV=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

echo "== PolkAudit demo backfill =="
echo ""
echo "This will TRUNCATE indexer tables (blocks, extrinsics, proposals, votes,"
echo "treasury_spends, processed_blocks, dead_letter_queue). Projects/users are kept."
echo ""
echo "Planned indexer settings:"
echo "  INDEXER_START_BLOCK=${DEMO_START_BLOCK}"
echo "  INDEXER_CATCHUP_WINDOW=${DEMO_CATCHUP_WINDOW}  (used when DB is empty without start block)"
echo ""

"$PY" - <<'PY'
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path("scripts").resolve()))
from _governance_db import fetch_counts, load_indexer_env, print_counts

load_indexer_env()
print_counts(asyncio.run(fetch_counts()))
PY

echo ""
if [[ "$YES" -ne 1 ]]; then
  read -r -p "Continue with reset? [y/N] " reply
  reply_lower=$(echo "$reply" | tr '[:upper:]' '[:lower:]')
  if [[ "$reply_lower" != "y" && "$reply_lower" != "yes" ]]; then
    echo "Aborted."
    exit 0
  fi
fi

echo ""
echo "Checking indexer process (stop it before reset if running)..."
if pgrep -f "src.main" >/dev/null 2>&1 || pgrep -f "apps/indexer" >/dev/null 2>&1; then
  echo "WARN: An indexer-like process may still be running. Stop it (Ctrl+C) to avoid races."
fi

echo "Truncating indexer tables..."
"$PY" - <<'PY'
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path("scripts").resolve()))
from _governance_db import load_indexer_env, reset_indexer_tables

load_indexer_env()
asyncio.run(reset_indexer_tables())
print("OK: indexer tables truncated")
PY

if [[ "$APPLY_ENV" -eq 1 ]]; then
  if [[ ! -f "$INDEXER_ENV" ]]; then
    echo "ERROR: $INDEXER_ENV not found" >&2
    exit 1
  fi
  set_kv() {
    local key="$1" val="$2" file="$3"
    if grep -q "^${key}=" "$file"; then
      if [[ "$(uname -s)" == Darwin ]]; then
        sed -i '' "s/^${key}=.*/${key}=${val}/" "$file"
      else
        sed -i "s/^${key}=.*/${key}=${val}/" "$file"
      fi
    else
      echo "${key}=${val}" >>"$file"
    fi
  }
  set_kv "INDEXER_START_BLOCK" "$DEMO_START_BLOCK" "$INDEXER_ENV"
  set_kv "INDEXER_CATCHUP_WINDOW" "$DEMO_CATCHUP_WINDOW" "$INDEXER_ENV"
  echo "OK: updated $INDEXER_ENV"
else
  echo ""
  echo "Add or update in apps/indexer/.env:"
  echo "  INDEXER_START_BLOCK=${DEMO_START_BLOCK}"
  echo "  INDEXER_CATCHUP_WINDOW=${DEMO_CATCHUP_WINDOW}"
fi

echo ""
echo "Next steps:"
echo "  1. Ensure apps/indexer/.env has INDEXER_START_BLOCK (see above)"
echo "  2. cd apps/indexer && ./run.sh"
echo "  3. Watch logs for: {\"event\": \"Found events\", \"proposals\": N, ...}"
echo "  4. ./scripts/check-governance-data.sh"
echo "  5. Refresh Overview in the frontend (~20k blocks may take 30–90+ min on public RPC)"
echo ""
echo "Tip: use a dedicated RPC endpoint (e.g. OnFinality) if catch-up is slow."
