# PolkAudit — Treasury Proposal Summary

**One-page overview for Polkadot voters.** Full proposal: [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md)

| Field | Value |
|-------|-------|
| **Project** | PolkAudit — governance transparency for Polkadot |
| **Funding path** | Polkadot OpenGov Treasury |
| **Phase** | 1 (MVP hardening + pilot) |
| **Amount** | USD 10,000 equivalent in DOT |
| **Duration** | 8 weeks |
| **License** | Apache 2.0 |

---

## Problem

Polkadot governance and treasury data are public on-chain but difficult to audit. Communities and reviewers lack a standardized pipeline from chain → database → API → exports.

## Solution

Open-source stack:

```text
Polkadot RPC → Indexer → PostgreSQL → FastAPI → Next.js dashboard → CSV/JSON exports
```

**Public demo:** Oracle VM indexer + Neon PostgreSQL + GCP Cloud Run API/UI.

## Phase 1 deliverables

| # | Deliverable |
|---|-------------|
| D1 | Public live demo (≥ 95% uptime during period) |
| D2 | OpenGov parser extension + backfill tooling |
| D3 | Updated demo assets (screenshots, JSON/CSV samples, video) |
| D4 | CI green + release `v0.1.0-mvp` |
| D5 | Fresh-clone setup in &lt; 20 minutes |
| D6 | ≥ 1 ecosystem pilot using exports or dashboard |

## Milestones (25% each)

| Milestone | Weeks | Focus |
|-----------|-------|-------|
| M1 | 1–2 | Public demo hardened; first progress report |
| M2 | 3–4 | OpenGov parser + governance evidence |
| M3 | 5–6 | CI + release + demo video |
| M4 | 7–8 | Pilot onboarding + final report |

## Budget (USD 10,000)

| Category | Amount |
|----------|--------|
| Development | $5,500 |
| Infrastructure | $2,000 |
| Documentation & demo | $1,000 |
| Security & quality | $1,000 |
| Contingency | $500 |

## Current status

| Item | Status |
|------|--------|
| Live indexing | ✅ Working |
| API + dashboard | ✅ Working |
| Hybrid deploy docs | ✅ Complete |
| Demo assets | ✅ Screenshots + sample exports |
| Public demo URL | 🔲 _(add before discussion)_ |
| Demo video | 🔲 _(add before discussion)_ |
| Public GitHub + CI | 🔲 _(push + Actions)_ |
| Polkassembly discussion | 🔲 _(post first)_ |
| Treasury referendum | 🔲 _(after feedback)_ |

## Links

| Document | Purpose |
|----------|---------|
| [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) | Full treasury proposal |
| [POLKASSEMBLY_DISCUSSION_POST.md](POLKASSEMBLY_DISCUSSION_POST.md) | Discussion post draft |
| [TREASURY_SUBMISSION_CHECKLIST.md](TREASURY_SUBMISSION_CHECKLIST.md) | Pre-submit checklist |
| [TREASURY_REVIEWER_FAQ.md](TREASURY_REVIEWER_FAQ.md) | Voter Q&A |
| [DEMO_HOSTING_GUIDE.md](DEMO_HOSTING_GUIDE.md) | Public demo deployment |
| [HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md) | Production-style architecture |

## Team

**Vijay** — Founder, Value Creating Solutions (maintainer)

- GitHub: _(add profile URL)_
- Contact: _(add email or Matrix)_
- Beneficiary DOT address: _(add before referendum)_

---

*Update evidence links in [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) before referendum submission.*
