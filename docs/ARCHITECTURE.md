# PolkAudit — System Architecture

## Overview

PolkAudit follows a four-layer pipeline for Polkadot governance transparency:

```text
Polkadot RPC (finalized blocks)
        ↓
   Indexer (Python)
        ↓
   PostgreSQL
        ↓
   FastAPI backend
        ↓
   Next.js dashboard + exports
```

## Components

### Indexer (`apps/indexer`)

- Connects to Polkadot via WebSocket RPC (`substrate-interface`).
- Scans **finalized** blocks sequentially; cursor in `processed_blocks`.
- Decodes extrinsics; extracts OpenGov / democracy / treasury calls.
- Writes `blocks`, `extrinsics`, `proposals`, `votes`, `treasury_spends`.
- Health HTTP server; Prometheus-style metrics; dead-letter queue for failures.
- Env: `DATABASE_URL`, `SUBSTRATE_RPC_URL`, `INDEXER_START_BLOCK`, `INDEXER_CATCHUP_WINDOW`.

### Database

- PostgreSQL (Neon in cloud, or local via Docker Compose).
- Schema owned by **backend Alembic migrations** (`apps/backend/migrations`).
- Indexer and API share the same `DATABASE_URL`.

### Backend (`apps/backend`)

- FastAPI application on port 8000.
- API-key authentication (`X-API-KEY`) for `/api/v1/*`.
- Services: stats, governance (proposals), treasury, exports.
- Public `/health` for load balancers and dashboard status.

### Dashboard (`apps/frontend`)

- Next.js application on port 3000.
- Pages: Overview, Proposals, Treasury, Exports, Settings.
- Server and client fetch via `lib/api.ts` with env-based API URL and key.

## Data flow

1. Indexer reads finalized block `N` from RPC.
2. Extrinsics decoded; governance/treasury rows inserted in one transaction.
3. `processed_blocks` advanced to `N`.
4. Backend queries PostgreSQL via SQLAlchemy async.
5. Dashboard calls `/api/v1/stats/overview`, `/proposals`, `/treasury/spends`.
6. Exports stream CSV/JSON from the same tables.

## Deployment topologies

### Local development

Three processes: indexer, backend, frontend — or `make dev` (Docker Compose).

### Hybrid (recommended for grant demo)

```text
Oracle Always Free VM (indexer)
        ↓
   Neon PostgreSQL
        ↑
GCP Cloud Run (backend + frontend)
```

See [HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md).

## Reliability

| Mechanism | Purpose |
|-----------|---------|
| Finalized blocks only | Avoid reorgs |
| `processed_blocks` cursor | Idempotent progress |
| Dead-letter queue | Failed blocks for retry |
| RPC retry + backoff | Transient network errors |
| Graceful shutdown | SIGINT/SIGTERM with timeout |
| API health checks | Cloud Run / sidebar status |

## Security

- No private user data; only public chain records.
- API keys via environment variables.
- TLS to Neon (`sslmode=require`); Cloud Run HTTPS termination.

## Related docs

- [SETUP.md](SETUP.md) — local setup
- [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) — funding technical summary
- [apps/indexer/README.md](../apps/indexer/README.md) — indexer operations
