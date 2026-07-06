# Weekly Progress Report

**Week ending:** 2026-05-28  
**Project:** PolkAudit — Treasury / Public Demo Readiness  
**Maintainer:** Vijay

---

## Objectives this week

- Prove live Polkadot indexing end-to-end (RPC → indexer → Neon → API → dashboard)
- Integrate v0 frontend (`apps/frontend`) with real backend API
- Document hybrid deployment (Oracle indexer + GCP Cloud Run + Neon)
- Prepare treasury documentation package for Polkassembly discussion

---

## Completed

| Area | Deliverable |
|------|-------------|
| **Indexer** | OpenGov parser (`Referenda`, `ConvictionVoting`, `Treasury.spend`); unit tests; graceful shutdown fix |
| **Database** | Shared Neon `DATABASE_URL` for indexer + backend; Alembic migrations |
| **API** | Stats, proposals, treasury, CSV/JSON exports; health endpoint |
| **Frontend** | Live KPIs, proposals/treasury/exports/settings pages; overview banner; API key support |
| **Infra** | `docker-compose.yml`, Cloud Build YAMLs, Oracle VM bootstrap scripts |
| **Scripts** | `verify-e2e.sh`, `hybrid-verify.sh`, `demo-backfill.sh`, `check-governance-data.sh` |
| **Docs** | `HYBRID_DEPLOYMENT.md`, `GCP_CLOUD_BUILD.md`, `INDEXER_FREE_HOSTING.md`, expanded READMEs |
| **Treasury docs** | `TREASURY_PROPOSAL.md`, `DEMO_SCRIPT.md`, `TREASURY_REVIEWER_FAQ.md`, `TREASURY_SUBMISSION_CHECKLIST.md`, `LICENSE` |

---

## In progress

| Item | Notes |
|------|-------|
| Indexer catch-up | Demo backfill from block 31,370,000; ~20k blocks to head on public RPC |
| Governance KPIs | Extrinsics indexing confirmed; proposals/votes still 0 in scanned range |
| Screenshots | Capture to `docs/assets/` when stack stable |
| GitHub | Large local diff; not yet pushed with CI |
| Demo video | Script ready in `DEMO_SCRIPT.md`; recording pending |

---

## Risks

| Risk | Status | Mitigation |
|------|--------|------------|
| Public RPC slow / disconnects | Observed | Dedicated RPC; aiohttp timeouts; hybrid Oracle deploy |
| Governance tables empty in demo | Active | Wider backfill; parser extension; honest UI empty states |
| Solo bandwidth | Ongoing | Strict MVP scope; AI-assisted implementation |
| Stuck indexer on Ctrl+C | Fixed | 8s shutdown timeout + double Ctrl+C force exit |

---

## Next week

1. Let indexer complete catch-up (or sufficient block count for demo)
2. Capture 5 screenshots + sample exports → `docs/assets/`
3. Record 3–5 minute demo video
4. Push to GitHub with GitHub Actions CI + `v0.1.0-mvp` tag
5. Fill team contact links in `TREASURY_PROPOSAL.md`
6. Post Polkassembly discussion, then submit Treasury referendum

---

## Evidence links

| Evidence | Location |
|----------|----------|
| E2E verify | `make verify-e2e` |
| Governance counts | `make check-governance` |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Full treasury proposal | [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) |
| Demo script | [DEMO_SCRIPT.md](DEMO_SCRIPT.md) |
| Submission checklist | [TREASURY_SUBMISSION_CHECKLIST.md](TREASURY_SUBMISSION_CHECKLIST.md) |
| Screenshots | `docs/assets/*.png` _(pending)_ |
| Demo video | _(add URL after recording)_ |
| Repository | _(add public GitHub URL after push)_ |

---

## Metrics snapshot (2026-05-28)

| Metric | Value |
|--------|-------|
| Blocks indexed | Growing (demo backfill in progress) |
| Extrinsics | Growing |
| Proposals / votes / treasury | 0 in current scan window |
| Services | Indexer + backend + frontend runnable locally |

---

*Copy this template for future weeks. Archive prior weeks in git history or add dated sections below.*
