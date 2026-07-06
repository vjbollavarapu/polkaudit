# PolkAudit — Demo Script (Grant & Reviewer Walkthrough)

**Duration:** 3–5 minutes  
**UI:** `apps/frontend` at http://localhost:3000  
**Prerequisites:** Indexer, backend, and frontend running; API key configured

---

## Before you record

1. Start services (three terminals):

```bash
# Terminal 1 — indexer
cd apps/indexer && ./run.sh

# Terminal 2 — backend
cd apps/backend && ./run.sh

# Terminal 3 — frontend
cd apps/frontend && npm run dev
```

2. Verify pipeline:

```bash
make verify-e2e
make check-governance
```

3. Confirm Overview shows **Blocks indexed** and **Extrinsics** > 0.

4. Optional: capture screenshots per [assets/README.md](assets/README.md).

---

## Opening (30 seconds)

> “PolkAudit makes Polkadot governance and treasury activity auditable. We index finalized blocks from the relay chain, store an extrinsic audit trail in PostgreSQL, and expose it through a secured API and this dashboard—with CSV and JSON exports for reviewers.”

Point to the **Overview banner**: *Live Polkadot indexing · Hybrid: Oracle indexer + GCP API · Data from finalized blocks*.

---

## Step 1 — Overview (60 seconds)

**URL:** http://localhost:3000/

**Show:**

- **Blocks indexed** and **Extrinsics** — proves live indexing (numbers should be > 0).
- **Last indexed block** — compare to a Polkadot explorer block height (roughly near finalized head if caught up).
- **Sidebar:** API = Operational, Indexer = Active.
- **Pipeline health** card — indexer running, database connected, API reachable.

**Say if governance KPIs are zero:**

> “Most blocks only contain routine calls like timestamp and parachain inherents. Proposals and treasury KPIs increase when OpenGov referenda or treasury spends appear in the blocks we’ve scanned. The pipeline is live even when those tables are still catching up.”

---

## Step 2 — Proposals (45 seconds)

**URL:** http://localhost:3000/proposals

**Show:**

- Table of proposals **or** empty state (“No governance proposals yet”).
- If rows exist: proposal index, section/method, block number, proposer.

**Say:**

> “Each row comes from decoded extrinsics—`Referenda.submit`, legacy `Democracy` calls, and related governance pallets. Clicking through shows on-chain metadata we store for audit.”

---

## Step 3 — Treasury (45 seconds)

**URL:** http://localhost:3000/treasury

**Show:**

- Treasury spend rows **or** empty state.
- Explain that `Treasury.spend` extrinsics in indexed blocks populate this view.

---

## Step 4 — Exports (60 seconds)

**URL:** http://localhost:3000/exports

**Demonstrate:**

1. **Download Overview JSON** — open file; show `total_blocks_indexed`, `total_extrinsics`, `last_indexed_block`.
2. **Download Proposals CSV** — show header row (even if no data rows yet).

**Say:**

> “Reviewers and auditors can download machine-readable exports without querying the chain directly. Everything traces back to our indexed block range.”

---

## Step 5 — Settings & API (30 seconds)

**URL:** http://localhost:3000/settings

**Show:**

- API base URL (localhost or Cloud Run URL in production).
- Connection test / health check success.

**Optional terminal:**

```bash
curl -s -H "X-API-KEY: $API_KEY" http://localhost:8000/api/v1/stats/overview | python3 -m json.tool
```

---

## Step 6 — Architecture (30 seconds, optional slide or README)

Show diagram from [ARCHITECTURE.md](ARCHITECTURE.md) or root README:

```text
Polkadot RPC → Indexer → PostgreSQL → FastAPI → Dashboard → Exports
```

Mention **hybrid deployment** for low cost: free Oracle VM indexer + GCP Cloud Run API/UI + Neon database ([HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md)).

---

## Closing (20 seconds)

> “PolkAudit is open source under Apache 2.0. The full stack is in our GitHub repo with setup docs, docker compose, and verification scripts. This demo shows live Polkadot indexing today; grant funding completes public deployment, deeper OpenGov coverage, and pilot onboarding for Polkadot DAOs.”

---

## Troubleshooting during demo

| Issue | Quick fix |
|-------|-----------|
| All KPIs zero | Start indexer; check shared `DATABASE_URL` |
| API error in UI | Start backend; check `API_KEY` in `.env.local` |
| Proposals empty | Normal for short scan—show extrinsics + exports instead |
| Slow indexer | Mention dedicated RPC; show `last_indexed_block` still advancing |

---

## Recording tips

- Resolution: 1440×900 or 1920×1080.
- Hide browser bookmarks bar; use dark theme consistently.
- Upload unlisted YouTube or Loom; add link to `docs/TREASURY_PROPOSAL.md` §11 and the Polkassembly discussion post.
