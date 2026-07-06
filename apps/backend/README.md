# PolkAudit Backend

FastAPI service that reads indexed Polkadot governance data from PostgreSQL and exposes authenticated REST APIs for the dashboard and integrations.

> **Monorepo guide:** [../../README.md](../../README.md) · **Indexer:** [../indexer/README.md](../indexer/README.md) · **Dashboard:** [../dashboard/README.md](../dashboard/README.md)

---

## Role in the stack

```text
PostgreSQL  ◀──  Indexer (writes)
     │
     ▼
  Backend (reads)  ──HTTP + X-API-KEY──▶  Dashboard
```

| Responsibility | Owner |
|----------------|--------|
| Database schema (Alembic migrations) | **This app** |
| Block ingestion | Indexer |
| UI | Dashboard |

Run **migrations here before starting the indexer**.

---

## Features

| Area | Description |
|------|-------------|
| **Async API** | FastAPI + SQLAlchemy 2 async (`asyncpg`) |
| **Auth** | `X-API-KEY` header on protected routes |
| **OpenAPI** | Interactive docs at `/docs` |
| **MVP APIs** | Stats, proposals, treasury, CSV export |
| **Security** | Rate limiting, security headers, audit logging |
| **Tracing** | `X-Request-ID` via `asgi-correlation-id` |
| **Neon-ready** | URL normalization + SSL for cloud Postgres |

Additional routers (reports, alerts, scoring, AI, compliance, etc.) exist for future phases; MVP consumers should use stats, proposals, treasury, and export endpoints.

---

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ (same database the indexer writes to)
- Migrations applied (`alembic upgrade head`)

---

## Quick start

### 1. Virtual environment and dependencies

```bash
cd apps/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment file

Create `apps/backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
API_KEY=dev-secret-key
LOG_LEVEL=INFO
```

- Use `postgresql://` or `postgresql+asyncpg://` — the app normalizes for asyncpg.
- For Neon, include `sslmode=require` in the URL.
- **Do not commit** this file.

### 3. Migrations (first time / after pull)

```bash
source venv/bin/activate
PYTHONPATH=. alembic upgrade head
PYTHONPATH=. alembic current
```

### 4. Run the server

```bash
./run.sh
```

**Always use `./run.sh`** from `apps/backend` — not bare `uvicorn` from the repo root.

| Endpoint | URL |
|----------|-----|
| Health | http://127.0.0.1:8000/health |
| OpenAPI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `API_KEY` | Yes | Secret for `X-API-KEY` on protected routes |
| `LOG_LEVEL` | No | Default `INFO` |

---

## Project layout

```text
apps/backend/
├── src/
│   ├── main.py              # FastAPI app, middleware, routers
│   ├── config.py            # Settings from .env
│   ├── database.py          # Async engine + session
│   ├── db_url.py            # Neon/asyncpg URL helpers
│   ├── auth.py              # API key dependency
│   ├── api/
│   │   ├── v1/              # MVP: router, export, reports, …
│   │   └── public/          # Public routes
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic response models
│   └── services/            # Business logic
├── migrations/              # Alembic versions
├── tests/
├── requirements.txt
├── run.sh                   # Preferred start command
└── alembic.ini
```

---

## MVP API reference

Send on protected routes:

```http
X-API-KEY: <value of API_KEY from .env>
```

### Core endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness (no API key) |
| `GET` | `/api/v1/stats/overview` | KPIs + indexing stats |
| `GET` | `/api/v1/proposals` | List proposals |
| `GET` | `/api/v1/proposals/{index}` | Proposal by index |
| `GET` | `/api/v1/treasury/spends` | Treasury spends |
| `GET` | `/api/v1/export/proposals/csv` | CSV download |

### Example: stats

```bash
curl -s -H "X-API-KEY: dev-secret-key" \
  http://127.0.0.1:8000/api/v1/stats/overview | python3 -m json.tool
```

Example response:

```json
{
  "total_proposals": 0,
  "total_votes": 0,
  "total_treasury_spend": "0",
  "total_blocks_indexed": 150,
  "total_extrinsics": 300,
  "last_indexed_block": 31387200
}
```

If `total_blocks_indexed` grows while proposals stay at `0`, the indexer is working and the backend connection is correct.

---

## Database & migrations

Schema is managed with **Alembic** only. The indexer does not create tables.

```bash
# Apply all migrations
PYTHONPATH=. alembic upgrade head

# New revision (after model changes)
PYTHONPATH=. alembic revision --autogenerate -m "description"
PYTHONPATH=. alembic upgrade head
```

### MVP tables (shared with indexer)

| Table | Purpose |
|-------|---------|
| `blocks`, `extrinsics`, `processed_blocks` | Indexer audit trail |
| `proposals`, `votes`, `treasury_spends` | Governance |
| `dead_letter_queue` | Indexer failures |

---

## Development

### Run without reload script

```bash
source venv/bin/activate
export PYTHONPATH=.
python -m uvicorn src.main:app --reload --reload-dir src --host 127.0.0.1 --port 8000
```

### Tests

```bash
source venv/bin/activate
pip install pytest pytest-asyncio
PYTHONPATH=. pytest tests/ -v
```

### Code quality (optional)

From repo root: `make lint` / `make test` if configured.

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'asgi_correlation_id'`

You are using **system** `uvicorn`, not the backend venv.

```bash
cd apps/backend
source venv/bin/activate
pip install -r requirements.txt
./run.sh
```

### `ModuleNotFoundError: No module named 'src'`

You started uvicorn from the **repo root**. Always run from `apps/backend` with `PYTHONPATH=.` or `./run.sh`.

### Reload spam / errors watching `venv/`

Use `./run.sh` — it sets `--reload-dir src` and excludes `venv/`.

### API returns zeros for proposals but indexer runs

Normal if no governance extrinsics were indexed yet. Check `total_blocks_indexed` and `total_extrinsics` in stats — those confirm the pipeline.

### SSL / Neon connection errors

Ensure `DATABASE_URL` is valid and includes `sslmode=require` for Neon. The app strips unsupported `channel_binding` params and sets `ssl=require` for `neon.tech` hosts.

---

## Security

- Use a strong `API_KEY` in production.
- Never commit `.env`.
- Rotate credentials if exposed.
- Restrict database network access.

---

## GCP deployment

Cloud Run via Cloud Build: [docs/GCP_CLOUD_BUILD.md](../../docs/GCP_CLOUD_BUILD.md). Migrations run automatically on container start; listens on `PORT` (8080 on Cloud Run).

## Related documentation

- [Root README](../../README.md) — full stack setup
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [docs/SETUP.md](../../docs/SETUP.md)
