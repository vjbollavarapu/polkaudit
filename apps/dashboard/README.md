# PolkAudit Dashboard

Next.js web portal for exploring Polkadot governance data indexed by PolkAudit — overview KPIs, proposals, treasury spends, exports, and connection settings.

> **Monorepo guide:** [../../README.md](../../README.md) · **Backend API:** [../backend/README.md](../backend/README.md) · **Indexer:** [../indexer/README.md](../indexer/README.md)

---

## Role in the stack

```text
Indexer  ──▶  PostgreSQL  ◀──  Backend (FastAPI)
                                    │
                                    │  REST + X-API-KEY
                                    ▼
                              Dashboard (this app)
```

The dashboard **does not** talk to the indexer or chain directly. It only calls the backend API.

---

## Features

| Page | Route | Description |
|------|-------|-------------|
| **Overview** | `/` | KPIs: blocks indexed, extrinsics, proposals, votes, treasury |
| **Proposals** | `/proposals` | Table of governance proposals |
| **Proposal detail** | `/proposals/[id]` | Single proposal view |
| **Treasury** | `/treasury` | Treasury spend table |
| **Exports** | `/exports` | CSV / JSON downloads |
| **Settings** | `/settings` | API URL, API key override, connection test |
| **Login** | `/login` | Auth UI (MVP scaffold) |

Built with **Next.js App Router**, **React Server Components** for data pages, and **Tailwind CSS** + Radix UI components.

---

## Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)
- Backend running at `http://127.0.0.1:8000`
- Indexer running (for live data in KPIs)

---

## Quick start

### 1. Install dependencies

```bash
cd apps/dashboard
npm install
```

### 2. Environment file

Create `apps/dashboard/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
API_KEY=dev-secret-key
NEXT_PUBLIC_API_KEY=dev-secret-key
```

| Variable | Used by | Must match |
|----------|---------|------------|
| `API_KEY` | Server Components (`fetch` on server) | `API_KEY` in `apps/backend/.env` |
| `NEXT_PUBLIC_API_KEY` | Client Components (sidebar badge, settings) | Same value |

**Never commit** `.env.local`.

### 3. Start development server

```bash
npm run dev
```

Open http://localhost:3000

Restart `npm run dev` after any `.env.local` change.

---

## Running with the full stack

Use three terminals (see [root README](../../README.md)):

| # | Service | Command |
|---|---------|---------|
| 1 | Indexer | `cd apps/indexer && ./run.sh` |
| 2 | Backend | `cd apps/backend && ./run.sh` |
| 3 | Dashboard | `cd apps/dashboard && npm run dev` |

---

## What you should see

| UI area | When indexer + backend are running |
|---------|-----------------------------------|
| **Blocks indexed / Extrinsics** | Numbers increase over time |
| **Proposals / Votes / Treasury** | Often `0` until OpenGov activity is indexed |
| **Recent activity** | Empty message explains why (normal) |
| **Sidebar** | No “No API Key” if `NEXT_PUBLIC_API_KEY` is set |
| **Settings** | “Active key configured” + connection test passes |

### Exports

| Export | Content when proposals empty |
|--------|------------------------------|
| **Proposals CSV** | Header row only |
| **Treasury CSV** | May alert not implemented |
| **Overview JSON** | Full stats including `total_blocks_indexed`, `total_extrinsics`, `last_indexed_block` |

Use **Overview JSON** to prove the pipeline during demos even when governance tables are empty.

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000/api/v1` | Backend API base (public, baked into client bundle) |
| `API_KEY` | Yes | — | Sent as `X-API-KEY` from server-side fetches |
| `NEXT_PUBLIC_API_KEY` | Yes* | — | Client-side key check / override UI (*required for sidebar status) |

Production: set these in your hosting provider’s env UI (e.g. Vercel), and point `NEXT_PUBLIC_API_URL` to your deployed backend.

---

## API client (`lib/api.ts`)

Central module for backend communication:

| Function | Purpose |
|----------|---------|
| `api.getStats()` | Overview KPIs |
| `api.getProposals()` | Proposal list |
| `api.getTreasurySpends()` | Treasury list |
| `fetchHealth()` | Backend `/health` (no API key) |
| `downloadExportCsv()` | Proposals CSV blob download |
| `downloadExportJson()` | Stats JSON download |
| `getApiKeyOverride()` / `setApiKeyOverride()` | Browser-local key override (Settings) |

Server pages use `API_KEY` from env. Client settings can override via `localStorage` when enabled.

---

## Project layout

```text
apps/dashboard/
├── app/
│   ├── page.tsx              # Overview
│   ├── proposals/
│   ├── treasury/
│   ├── exports/
│   ├── settings/
│   ├── login/
│   ├── layout.tsx            # Sidebar + shell
│   └── globals.css
├── components/
│   ├── sidebar.tsx           # Nav + API/indexer status
│   ├── topbar.tsx
│   ├── kpi-card.tsx
│   └── ui/                   # shadcn-style primitives
├── lib/
│   ├── api.ts                # Backend client
│   ├── auth.ts               # Auth helpers
│   └── utils.ts
├── .env.local                # Local config (not committed)
├── next.config.mjs
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

---

## Settings page

| Section | Editable? | Notes |
|---------|-----------|-------|
| **Environment information** | Read-only | Shows API base URL, env key status from `.env.local` |
| **API connection** | Yes | Custom API key toggle + save (browser storage) |
| **Connection test** | Button | Hits backend `/health` (no API key required) |

To use a custom key: Settings → enable **Use custom API key** → enter same value as backend `API_KEY` → **Save Settings**.

---

## Production build

```bash
npm run build
npm run start
```

Ensure production env vars are set and the backend is reachable from the browser (CORS is open on backend MVP — tighten for production).

## GCP deployment

Cloud Build bakes `NEXT_PUBLIC_API_URL` from the deployed backend URL. See [docs/GCP_CLOUD_BUILD.md](../../docs/GCP_CLOUD_BUILD.md).

---

## Troubleshooting

### All KPIs show `0`

1. Confirm indexer is running and logs show `Successfully committed block`.
2. Curl stats — check `total_blocks_indexed` and `total_extrinsics`:

   ```bash
   curl -s -H "X-API-KEY: dev-secret-key" http://127.0.0.1:8000/api/v1/stats/overview
   ```

3. If blocks grow but proposals stay `0`, governance activity has not been indexed yet — expected.

### Sidebar shows **No API Key**

Add `NEXT_PUBLIC_API_KEY=dev-secret-key` to `.env.local`, restart `npm run dev`, hard-refresh (Cmd+Shift+R).

### `API Error: 401` or fetch failures

- Backend not running → start `apps/backend/./run.sh`
- Wrong `API_KEY` → must match backend `.env`
- Wrong `NEXT_PUBLIC_API_URL` → should end with `/api/v1`

### Exports download empty / only headers

Proposals CSV is empty when there are no rows in `proposals`. Use Overview JSON export for indexing stats.

### Connection test fails

Backend down or wrong URL. Test directly: http://127.0.0.1:8000/health

---

## Tech stack

- **Next.js** (App Router)
- **React 19** / **TypeScript**
- **Tailwind CSS**
- **Radix UI** + custom components
- **lucide-react** icons
- **sonner** toasts

Originally scaffolded with [v0.app](https://v0.app); integrated into the PolkAudit monorepo.

---

## Related documentation

- [Root README](../../README.md) — full stack setup
- [Backend README](../backend/README.md) — API and auth
- [docs/DEMO_SCRIPT.md](../../docs/DEMO_SCRIPT.md) — demo walkthrough
- [docs/PolkAudit_NON_TECHNICAL_OVERVIEW.md](../../docs/PolkAudit_NON_TECHNICAL_OVERVIEW.md)
