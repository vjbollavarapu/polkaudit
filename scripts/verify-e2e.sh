#!/usr/bin/env bash
# Quick end-to-end checks for PolkAudit (indexer → DB → backend → exports)
set -euo pipefail

API_KEY="${API_KEY:-dev-secret-key}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
INDEXER_URL="${INDEXER_URL:-http://127.0.0.1:8001}"

echo "== PolkAudit E2E verification =="
echo "Backend: $BACKEND_URL"
echo "Indexer: $INDEXER_URL"
echo ""

fail() { echo "FAIL: $1"; exit 1; }
ok() { echo "OK: $1"; }

# Backend health
if curl -sf "$BACKEND_URL/health" >/dev/null; then
  ok "Backend /health"
else
  fail "Backend not reachable at $BACKEND_URL/health — run: cd apps/backend && ./run.sh"
fi

# Indexer health (optional)
if curl -sf "$INDEXER_URL/health" >/dev/null 2>&1; then
  ok "Indexer /health"
else
  echo "WARN: Indexer not reachable at $INDEXER_URL/health (optional if using Neon + remote indexer)"
fi

# Stats overview
STATS=$(curl -sf -H "X-API-KEY: $API_KEY" "$BACKEND_URL/api/v1/stats/overview") || fail "Stats API failed (check API_KEY)"
echo ""
echo "Stats overview:"
echo "$STATS" | python3 -m json.tool

BLOCKS=$(echo "$STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_blocks_indexed',0))")
EXTR=$(echo "$STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_extrinsics',0))")

if [[ "$BLOCKS" -gt 0 ]]; then
  ok "Indexing pipeline ($BLOCKS blocks, $EXTR extrinsics)"
else
  echo "WARN: total_blocks_indexed is 0 — start indexer: cd apps/indexer && ./run.sh"
fi

# CSV export
CSV=$(curl -sf -H "X-API-KEY: $API_KEY" "$BACKEND_URL/api/v1/export/proposals/csv" | head -1)
if [[ -n "$CSV" ]]; then
  ok "Proposals CSV export (header: $CSV)"
else
  fail "CSV export empty or failed"
fi

echo ""
echo "Phase 1C checklist:"
echo "  [ ] Dashboard Overview shows blocks/extrinsics > 0"
echo "  [ ] Exports page downloads CSV + JSON"
echo "  [ ] Screenshots saved to docs/assets/ (see docs/assets/README.md)"
echo ""
echo "All automated checks passed."
