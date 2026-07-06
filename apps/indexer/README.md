# PolkAudit Indexer

Async worker that connects to a Polkadot RPC node, scans **finalized** blocks, decodes extrinsics, and writes governance and audit data to PostgreSQL.

> **Monorepo guide:** [../../README.md](../../README.md) · **Backend (migrations):** [../backend/README.md](../backend/README.md) · **Dashboard:** [../dashboard/README.md](../dashboard/README.md)

---

## Role in the stack

```text
Polkadot RPC (wss)  ──▶  Indexer  ──▶  PostgreSQL  ◀──  Backend / Dashboard
```

| Responsibility | Owner |
|----------------|--------|
| Schema / migrations | **Backend** (`alembic upgrade head` first) |
| Block ingestion | **This app** |
| HTTP API for UI | Backend |

This is **not** a web server for the portal. Do **not** run `uvicorn` here — use `./run.sh`.

---

## Features

| Feature | Description |
|---------|-------------|
| **Finalized scanner** | Catches up from last processed block to chain head |
| **OpenGov parser** | `Referenda`, `ConvictionVoting`, `Treasury`, legacy `Democracy` |
| **Extrinsic audit trail** | Every successfully decoded call stored in `extrinsics` |
| **Dead-letter queue** | Failed blocks recorded in `dead_letter_queue` |
| **Graceful shutdown** | SIGINT / SIGTERM handling |
| **Health & metrics** | HTTP on `METRICS_PORT` (default `8001`) |
| **Demo skip** | `INDEXER_START_BLOCK` / `INDEXER_CATCHUP_WINDOW` for fast catch-up |

---

## Prerequisites

- Python 3.11+
- PostgreSQL with schema from backend migrations
- Polkadot RPC URL (WebSocket recommended)

---

## Quick start

### 1. Apply backend migrations first

```bash
cd apps/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Configure apps/backend/.env with DATABASE_URL
PYTHONPATH=. alembic upgrade head
```

### 2. Virtual environment and dependencies

```bash
cd apps/indexer
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Important:** Install only from `requirements.txt`. The package must be **`substrate-interface`** (hyphen). Do not `pip install substrateinterface` — that installs a broken 1.0.0 stub.

Verify:

```bash
python -c "from substrateinterface import SubstrateInterface; assert hasattr(SubstrateInterface, 'decode_scale'); print('OK')"
```

### 3. Environment file

Create `apps/indexer/.env`:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DATABASE
SUBSTRATE_RPC_URL=wss://rpc.polkadot.io
LOG_LEVEL=INFO
METRICS_PORT=8001
RETRY_DELAY_SECONDS=2

# Recommended for local demos (recent Polkadot height)
INDEXER_START_BLOCK=31387000
INDEXER_CATCHUP_WINDOW=2000
```

Use the **same database** as `apps/backend/.env`.

### 4. Run the indexer

```bash
./run.sh
```

Or manually:

```bash
export PYTHONPATH=.
python -m src.main
```

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | Same DB as backend |
| `SUBSTRATE_RPC_URL` | No | `wss://rpc.polkadot.io` | Polkadot RPC endpoint |
| `LOG_LEVEL` | No | `INFO` | Log level |
| `METRICS_PORT` | No | `8001` | Health/metrics HTTP port |
| `RETRY_DELAY_SECONDS` | No | `2` | Sleep when caught up with chain head |
| `INDEXER_START_BLOCK` | No | `0` | Jump here if DB is behind (demo) |
| `INDEXER_CATCHUP_WINDOW` | No | `2000` | On empty DB, start N blocks behind head |

---

## What gets indexed

| On-chain call (examples) | DB table |
|--------------------------|----------|
| `Referenda.submit`, `Democracy.propose` | `proposals` |
| `ConvictionVoting.vote`, `Democracy.vote` | `votes` |
| `Treasury.spend` | `treasury_spends` |
| All decoded extrinsics | `extrinsics` |
| Block metadata | `blocks` |
| Progress cursor | `processed_blocks` |

Most blocks only contain routine calls (`Timestamp`, `ParaInherent`, etc.). Logs often show:

```json
{"extrinsics_added": 2, "governance_added": 0, "event": "Successfully committed block"}
```

That is **normal**. Governance KPIs in the dashboard rise only when referenda/vote/spend extrinsics appear in scanned blocks.

---

## Healthy log examples

```json
{"event": "Database connection verified"}
{"event": "Starting FinalizedScanner"}
{"event": "Catching up", "next_block": 31387070, "target": 31388340, "last_processed": 31387069}
{"event": "SubstrateInterface initialized successfully"}
{"event": "Successfully committed block", "block_number": 31387070, "extrinsics_added": 2, "governance_added": 0}
```

| Check | Good sign |
|-------|-----------|
| `extrinsics_added` | > 0 per block (after substrate fix) |
| `blocks_added` | 1 per block |
| `next_block` | Approaches `target` over time |

---

## HTTP endpoints (indexer process)

| Path | Port | Description |
|------|------|-------------|
| `/health` | `METRICS_PORT` (8001) | DB connectivity check |
| `/metrics` | `METRICS_PORT` (8001) | Prometheus metrics |

The dashboard sidebar “Indexer” status uses **backend** `/health`, not the indexer port. Both should be up for a full stack.

---

## Project layout

```text
apps/indexer/
├── src/
│   ├── main.py           # Entry: verify DB, start scanner + metrics
│   ├── scanner.py        # Finalized block loop
│   ├── parser.py         # ChainParser (OpenGov + democracy)
│   ├── models.py         # SQLAlchemy models (align with migrations)
│   ├── database.py       # Async engine
│   ├── config.py         # Settings
│   ├── db_url.py         # Neon/asyncpg helpers
│   └── server.py         # aiohttp health/metrics
├── tests/
│   ├── test_parser.py    # Parser unit tests (no RPC)
│   └── test_scanner.py
├── requirements.txt
├── run.sh                # Preferred start command
└── .env                  # Not committed
```

---

## Development

### Tests

```bash
source venv/bin/activate
pip install pytest pytest-asyncio
PYTHONPATH=. pytest tests/ -v
```

### Parser smoke test (live RPC)

```bash
PYTHONPATH=. python -c "
import asyncio, aiohttp
from src.parser import ChainParser

async def main():
    url = 'https://rpc.polkadot.io'
    async with aiohttp.ClientSession() as s:
        r = await s.post(url, json={'jsonrpc':'2.0','method':'chain_getFinalizedHead','params':[],'id':1})
        head = (await r.json())['result']
        r2 = await s.post(url, json={'jsonrpc':'2.0','method':'chain_getBlock','params':[head],'id':1})
        data = (await r2.json())['result']
        num = int(data['block']['header']['number'], 16)
        p = ChainParser()
        out = p.parse_block(num, data['block']['extrinsics'])
        print('extrinsics', len(out['extrinsics']), 'proposals', len(out['proposals']))

asyncio.run(main())
"
```

---

## Demo backfill (governance / treasury in the UI)

If Overview shows blocks and extrinsics but **proposals/votes/treasury stay at 0**, the indexer likely scanned a short window with no matching governance extrinsics.

From the repo root (same `DATABASE_URL` in `apps/indexer/.env` and `apps/backend/.env`):

```bash
# 1. Stop the running indexer (Ctrl+C)

# 2. Reset indexer tables + show recommended env (interactive)
make demo-backfill

# Or non-interactive + write apps/indexer/.env:
./scripts/demo-backfill.sh --yes --apply-env

# 3. Restart indexer
cd apps/indexer && ./run.sh

# 4. Check counts (repeat while catch-up runs)
make check-governance
```

Defaults: `INDEXER_START_BLOCK=31370000`, scans forward to chain head (~20k+ blocks). Catch-up can take **30–90+ minutes** on the public RPC; use a dedicated endpoint for faster runs.

Watch indexer logs for:

```json
{"event": "Found events", "proposals": 1, "votes": 5, "spends": 0}
```

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'substrateinterface'` or decode always fails

Wrong package installed:

```bash
pip uninstall -y substrateinterface
pip install -r requirements.txt
```

### `extrinsics_added: 0` on every block

Same as above — stub package causes decode failure. After fix, expect `extrinsics_added: 2` (typical).

### Indexer at block 100 but chain is at 31,000,000+

Fresh DB started from genesis. Set `INDEXER_START_BLOCK` to a recent height or reset `processed_blocks` and use `INDEXER_CATCHUP_WINDOW`.

### `Package renamed, please install substrate-interface`

The `substrateinterface` 1.0.0 stub is installed. Uninstall and reinstall from `requirements.txt`.

### Database errors on start

Run backend migrations first. Indexer does not create schema.

### RPC timeouts / slow catch-up

Use a dedicated RPC provider; increase `RETRY_DELAY_SECONDS`; ensure stable network. Catch-up of thousands of blocks takes time (~3–5 s/block in dev).

### Ctrl+C does not stop the indexer

The scanner can block on Polkadot RPC or `substrate-interface` decode. **Press Ctrl+C twice** to force exit, or kill the process:

```bash
pkill -f "apps/indexer.*src.main"   # or: kill -9 $(pgrep -f "python -m src.main")
```

Recent versions wait up to 8s for the scanner task, then exit.

---

## Operational notes

- Run indexer **before or alongside** backend; dashboard needs backend, backend needs data from indexer.
- One indexer instance per database (avoid duplicate writers).
- For production: monitor `dead_letter_queue`, `polkaudit_indexer_last_processed_block` metric, and RPC lag (`target - last_processed`).

---

## Hybrid deployment (recommended)

**Oracle VM indexer** + GCP Cloud Run API/UI + Neon:

- [docs/HYBRID_DEPLOYMENT.md](../../docs/HYBRID_DEPLOYMENT.md)
- `sudo bash deploy/oracle/setup-indexer.sh` on the VM
- Secrets in `/etc/polkaudit/indexer.env`

## GCP Cloud Run (optional)

Full-stack Cloud Build (includes indexer on Run): [docs/GCP_CLOUD_BUILD.md](../../docs/GCP_CLOUD_BUILD.md). For hybrid, only backend/dashboard use Cloud Run; indexer stays on Oracle.

## Related documentation

- [Root README](../../README.md) — full stack setup
- [Backend README](../backend/README.md) — migrations and API
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
