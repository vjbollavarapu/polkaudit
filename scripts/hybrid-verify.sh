#!/usr/bin/env bash
# Verify hybrid deployment: GCP Cloud Run backend (+ optional dashboard) + Oracle indexer via DB stats.
set -euo pipefail

API_KEY="${API_KEY:-}"
BACKEND_URL="${BACKEND_URL:-}"
DASHBOARD_URL="${DASHBOARD_URL:-}"

fail() { echo "FAIL: $1"; exit 1; }
ok() { echo "OK: $1"; }
warn() { echo "WARN: $1"; }

echo "== PolkAudit hybrid verification =="
echo ""

if [[ -z "$BACKEND_URL" ]]; then
  echo "Set BACKEND_URL to your Cloud Run backend URL, e.g.:"
  echo "  export BACKEND_URL=https://polkaudit-backend-xxxxx.run.app"
  fail "BACKEND_URL not set"
fi

BACKEND_URL="${BACKEND_URL%/}"

if [[ -z "$API_KEY" ]]; then
  warn "API_KEY not set — stats/export checks may fail"
fi

echo "Backend: $BACKEND_URL"
[[ -n "$DASHBOARD_URL" ]] && echo "Dashboard: $DASHBOARD_URL"
echo ""

# Backend health
if curl -sf "$BACKEND_URL/health" >/dev/null; then
  ok "Backend /health (Cloud Run)"
else
  fail "Backend not reachable — check Cloud Run deploy and URL"
fi

# Stats (proves Oracle indexer → Neon → backend path)
if [[ -n "$API_KEY" ]]; then
  STATS=$(curl -sf -H "X-API-KEY: $API_KEY" "$BACKEND_URL/api/v1/stats/overview") \
    || fail "Stats API failed (wrong API_KEY?)"
  echo ""
  echo "Stats overview:"
  echo "$STATS" | python3 -m json.tool

  BLOCKS=$(echo "$STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_blocks_indexed',0))")
  EXTR=$(echo "$STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_extrinsics',0))")
  LAST=$(echo "$STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('last_indexed_block',0))")

  if [[ "$BLOCKS" -gt 0 ]]; then
    ok "Hybrid pipeline active ($BLOCKS blocks, $EXTR extrinsics, last block $LAST)"
  else
    warn "total_blocks_indexed is 0 — start Oracle indexer: sudo systemctl start polkaudit-indexer"
  fi

  CSV=$(curl -sf -H "X-API-KEY: $API_KEY" "$BACKEND_URL/api/v1/export/proposals/csv" | head -1)
  [[ -n "$CSV" ]] && ok "CSV export" || warn "CSV export failed"
else
  warn "Skipping stats (set API_KEY)"
fi

# Dashboard (optional)
if [[ -n "$DASHBOARD_URL" ]]; then
  DASHBOARD_URL="${DASHBOARD_URL%/}"
  if curl -sf -o /dev/null -w "%{http_code}" "$DASHBOARD_URL" | grep -qE '200|307|308'; then
    ok "Dashboard responds at $DASHBOARD_URL"
  else
    warn "Dashboard URL did not return 200 — may still be cold starting"
  fi
fi

echo ""
echo "Oracle VM checks (SSH):"
echo "  sudo systemctl status polkaudit-indexer"
echo "  sudo journalctl -u polkaudit-indexer -n 20 --no-pager"
echo ""
echo "All automated hybrid checks done."
