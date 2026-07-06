# PolkAudit – Setup Guide

> **Canonical setup:** See the detailed guide in the repository root [README.md](../README.md). This file is a short reference.

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (local or Neon)
- Polkadot RPC URL (`wss://rpc.polkadot.io` for dev)

## Paths (monorepo)

All commands use `apps/` — not repo-root `backend/` or `indexer/`.

| App | Directory |
|-----|-----------|
| Backend | `apps/backend` |
| Indexer | `apps/indexer` |
| Dashboard | `apps/dashboard` |

## One-time: migrations

```bash
cd apps/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Create apps/backend/.env with DATABASE_URL and API_KEY
PYTHONPATH=. alembic upgrade head
```

## Docker Compose (optional)

From repo root:

```bash
docker compose up --build
# or: make dev
```

See [README.md](../README.md#docker-compose-one-command) for URLs and notes.

## Verify pipeline

```bash
make verify-e2e
```

## Run (3 terminals)

```bash
# Terminal 1 — Indexer
cd apps/indexer && source venv/bin/activate && pip install -r requirements.txt && ./run.sh

# Terminal 2 — Backend
cd apps/backend && source venv/bin/activate && ./run.sh

# Terminal 3 — Dashboard
cd apps/dashboard && npm install && npm run dev
```

## URLs

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| Backend API / docs | http://127.0.0.1:8000/docs |
| Backend health | http://127.0.0.1:8000/health |
| Indexer health | http://127.0.0.1:8001/health |

## API key

Set the same key in `apps/backend/.env` and `apps/dashboard/.env.local`:

```env
API_KEY=dev-secret-key
NEXT_PUBLIC_API_KEY=dev-secret-key
```

Request header: `X-API-KEY: dev-secret-key`
