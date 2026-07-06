# PolkAudit — Polkadot Treasury Proposal (Phase 1)

**Funding path:** Polkadot OpenGov Treasury via community referendum  
**Discussion:** Polkassembly (post draft in [POLKASSEMBLY_DISCUSSION_POST.md](POLKASSEMBLY_DISCUSSION_POST.md) first)  
**Requested amount:** **USD 10,000 equivalent in DOT** (paid in DOT at spot on payout date)  
**Duration:** **8 weeks**  
**License:** Apache 2.0  
**Repository:** _(add public GitHub URL before posting)_  
**Last updated:** 2026-05-28

> **Executive summary:** PolkAudit is an open-source governance transparency stack for Polkadot. It indexes finalized relay-chain blocks, stores an audit trail in PostgreSQL, exposes a secured REST API, and presents KPIs and exports through a Next.js dashboard. This Phase 1 treasury request funds a focused 8-week milestone to harden the live public demo, improve OpenGov coverage, and onboard the first pilot users—not speculative multichain or AI features.

---

## 1. Why Polkadot Treasury

Polkadot ecosystem funding for open-source tooling is delivered through **OpenGov Treasury** proposals with public discussion on Polkassembly. This proposal follows that path: share a live demo, gather community feedback, and request milestone-based funding from the Treasury.

This proposal asks the Polkadot community to fund **Phase 1** of PolkAudit: a practical, verifiable governance transparency tool that benefits DAOs, grantees, auditors, and treasury reviewers across the ecosystem.

---

## 2. Problem

Polkadot OpenGov and treasury activity are **public on-chain**, but they are hard to audit in practice:

- Governance data is spread across extrinsics, pallets, and referenda with no single reporting layer for communities, auditors, or foundations.
- Block explorers show raw chain data; they do not provide **governance KPIs**, **exportable audit packs**, or **operational health** for long-running indexers.
- DAOs, parachain teams, and institutional reviewers need **repeatable evidence**: blocks indexed, proposals tracked, treasury spends summarized, CSV/JSON exports for compliance workflows.

Without tooling, transparency claims are difficult to verify—and treasury voters cannot easily assess whether ecosystem funds are being monitored responsibly.

---

## 3. Solution

**PolkAudit** provides a four-layer open-source pipeline:

```text
Polkadot RPC (finalized blocks)
        ↓
   Indexer (Python, substrate-interface)
        ↓
   PostgreSQL (Neon or self-hosted)
        ↓
   FastAPI backend (/api/v1)
        ↓
   Next.js dashboard + CSV/JSON exports
```

### Public demo architecture (live today)

```text
Oracle Always Free VM (indexer, 24/7)
        ↓
Neon PostgreSQL (shared audit database)
        ↓
GCP Cloud Run (public API + dashboard)
```

Documented in [HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md) and [DEMO_HOSTING_GUIDE.md](DEMO_HOSTING_GUIDE.md).

### What voters can verify today (MVP)

| Capability | Status |
|------------|--------|
| Live Polkadot finalized-block indexing | ✅ Working |
| Extrinsic audit trail in database | ✅ Working |
| Stats API (blocks, extrinsics, last block) | ✅ Working |
| Dashboard Overview / Proposals / Treasury / Exports | ✅ Working |
| CSV proposals export + Overview JSON | ✅ Working |
| Hybrid deploy (Oracle indexer + GCP API/UI + Neon) | ✅ Documented |
| OpenGov proposal/vote/treasury row detection | ⚠️ Partial—depends on scanned block range and parser coverage |
| Public demo URL | 🔲 _(add Cloud Run or custom domain URL)_ |
| Demo video | 🔲 _(add YouTube/Loom link)_ |
| Public GitHub + CI | 🔲 _(push + tag `v0.1.0-mvp`)_ |

Governance KPIs populate when matching extrinsics appear in indexed blocks (`Referenda.submit`, `ConvictionVoting.vote`, `Treasury.spend`, etc.). The dashboard labels empty governance tables honestly while indexing is live.

---

## 4. Phase 1 deliverables (8 weeks, in scope)

| # | Deliverable | Acceptance criteria |
|---|-------------|---------------------|
| D1 | **Public live demo** | Dashboard URL in README; uptime ≥ 95% during grant period |
| D2 | **OpenGov parser extension** | Additional referenda/treasury paths; backfill tooling documented |
| D3 | **Governance evidence pack** | Updated screenshots + sample JSON/CSV in `docs/assets/` |
| D4 | **CI + release** | GitHub Actions green on `main`; tag `v0.1.0-mvp` |
| D5 | **Reviewer onboarding** | Fresh-clone setup in &lt; 20 min via README + `make dev` |
| D6 | **Pilot onboarding** | ≥ 1 ecosystem team using exports or read-only dashboard |
| D7 | **Progress reporting** | Bi-weekly public updates (Polkassembly comment or GitHub issue) |

### Out of scope (Phase 2 or self-funded)

- Multichain adapters (Ethereum/Cosmos/Solana mocks in repo)
- AI recommendation engine
- Slack/Discord integrations (code exists; not Phase 1 deliverable)
- Governance scoring / analytics forecasting
- Enterprise compliance automation
- Paid managed hosting product launch

---

## 5. Milestones and payment schedule

**Total ask:** USD 10,000 equivalent in DOT  
**Payment:** Milestone-based, invoiced in DOT to beneficiary address below

| Milestone | Week | Deliverable | Payment |
|-----------|------|-------------|---------|
| **M1** | 1–2 | Public demo live; `hybrid-verify.sh` passes; bi-weekly report #1 | **25%** ($2,500) |
| **M2** | 3–4 | OpenGov parser + backfill; governance rows or documented empty-state UX | **25%** ($2,500) |
| **M3** | 5–6 | CI green; `v0.1.0-mvp` tagged; demo video + updated `docs/assets/` | **25%** ($2,500) |
| **M4** | 7–8 | ≥ 1 pilot team onboarded; final report; handoff doc for Phase 2 | **25%** ($2,500) |

Milestone completion is reported publicly on Polkassembly (reply to discussion) and in the repository (`docs/WEEKLY_REPORT.md` or GitHub milestone).

---

## 6. Budget breakdown (USD 10,000)

| Category | Amount | Notes |
|----------|--------|-------|
| Lead development (8 weeks) | $5,500 | Indexer, API, dashboard, parser, deployment |
| Infrastructure | $2,000 | Neon PostgreSQL, GCP Cloud Run, RPC provider, Oracle VM |
| Documentation & demo | $1,000 | Video, screenshots, Polkassembly updates, pilot onboarding |
| Security & quality | $1,000 | Dependency review, API hardening, basic security checklist |
| Contingency | $500 | RPC outages, scope adjustments |
| **Total** | **$10,000** | |

Infrastructure is intentionally lean: hybrid Oracle + Neon + Cloud Run keeps recurring cost near **$0–$50/month** at demo scale.

---

## 7. Team

**Vijay** — Founder, Value Creating Solutions  
Maintainer and primary developer. Responsible for architecture, implementation, deployment, milestone reporting, and ecosystem outreach.

| Field | Value |
|-------|-------|
| **GitHub** | _(add profile URL)_ |
| **Polkadot on-chain identity** | _(add before treasury referendum)_ |
| **Contact** | _(add email or Matrix)_ |
| **Beneficiary DOT address** | _(add before treasury referendum — never commit private keys)_ |

**Development model:** Founder-led with AI-assisted implementation; all code reviewed and run locally before merge.

---

## 8. Success metrics (8-week period)

| Metric | Target |
|--------|--------|
| Blocks indexed (Polkadot relay chain) | ≥ 25,000 finalized blocks |
| API uptime (public demo) | ≥ 95% |
| Open-source release | `v0.1.0-mvp` tagged |
| Documentation | Demo hosting + hybrid deploy + treasury proposal complete |
| Ecosystem pilots | ≥ 1 team using exports or API |
| Governance events indexed | ≥ 50 votes or ≥ 5 proposals (stretch; depends on chain activity + parser) |

Metrics are reported honestly; empty governance tables during short scan windows are documented, not hidden.

---

## 9. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Public RPC rate limits / slow catch-up | Dedicated RPC endpoint; `INDEXER_START_BLOCK` demo mode; documented backfill |
| Solo maintainer bandwidth | Strict Phase 1 scope; bi-weekly public reports |
| Schema drift indexer vs API | Backend Alembic as source of truth; shared `DATABASE_URL` |
| Governance KPIs empty in demo | Honest UI copy; wider backfill; parser extensions |
| Code copied after public release | Apache 2.0 + execution speed; differentiation via live demo, maintenance, pilots |

---

## 10. Open-source commitment

- **License:** Apache 2.0 ([LICENSE](../LICENSE))
- All treasury-funded work merged to public GitHub
- No proprietary lock-in on database or hosting (standard Postgres + HTTP API)
- Issues and roadmap public in repository

---

## 11. Current evidence

| Evidence | Location |
|----------|----------|
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Setup guide | [SETUP.md](SETUP.md), root [README.md](../README.md) |
| Hybrid deployment | [HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md) |
| Public demo guide | [DEMO_HOSTING_GUIDE.md](DEMO_HOSTING_GUIDE.md) |
| E2E verification | `scripts/hybrid-verify.sh`, `make verify-e2e` |
| Demo walkthrough | [DEMO_SCRIPT.md](DEMO_SCRIPT.md) |
| Screenshots | [assets/](assets/) |
| Sample exports | [assets/sample-overview.json](assets/sample-overview.json), [assets/sample-proposals.csv](assets/sample-proposals.csv) |
| Demo video | _(add link before referendum)_ |
| Live demo URL | _(add link before referendum)_ |
| Public GitHub | _(add link before referendum)_ |

---

## 12. Phase 2 (future, not in this ask)

If Phase 1 delivers and community feedback is positive, a separate treasury request may cover:

- Scheduled governance reports (PDF/CSV packs)
- Slack/Discord treasury alerts
- Parachain-specific indexing
- Governance scoring and institutional audit templates
- Managed hosting for pilot clients

See [ROADMAP.md](ROADMAP.md) and [12_MONTH_EXECUTION_PLAN.md](12_MONTH_EXECUTION_PLAN.md).

---

## 13. Submission workflow

### Step 1 — Discussion (now)

1. Complete [TREASURY_SUBMISSION_CHECKLIST.md](TREASURY_SUBMISSION_CHECKLIST.md) Phases A–D
2. Deploy public demo per [DEMO_HOSTING_GUIDE.md](DEMO_HOSTING_GUIDE.md)
3. Push public GitHub repo
4. Post [POLKASSEMBLY_DISCUSSION_POST.md](POLKASSEMBLY_DISCUSSION_POST.md) on Polkassembly
5. Collect feedback for 1–2 weeks; answer questions using [TREASURY_REVIEWER_FAQ.md](TREASURY_REVIEWER_FAQ.md)

### Step 2 — Treasury referendum (after discussion)

1. Register or link **on-chain identity** on Polkadot
2. Add **beneficiary DOT address** to proposal
3. Submit treasury spend proposal on Polkassembly with this document as reference
4. Link discussion thread in referendum post
5. Report milestone completion publicly after approval

### Step 3 — Post-approval

1. Deliver milestones M1–M4 on schedule
2. Post bi-weekly progress updates
3. Publish final report and Phase 2 scope based on pilot feedback

---

## Appendix: Fields to fill before posting

| Field | Status |
|-------|--------|
| Public GitHub URL | 🔲 |
| Live demo dashboard URL | 🔲 |
| Demo video URL | 🔲 |
| GitHub profile | 🔲 |
| Contact email / Matrix | 🔲 |
| On-chain identity | 🔲 |
| Beneficiary DOT address | 🔲 |
| Polkassembly discussion URL | 🔲 _(after posting)_ |
| Treasury referendum URL | 🔲 _(after submission)_ |

---

*Prepared for Polkadot OpenGov Treasury. Update evidence URLs and payment details before referendum submission.*
