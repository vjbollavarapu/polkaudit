# Polkassembly Discussion Post — Draft

Copy the sections below into a **Polkassembly Discussion** on [polkadot.polkassembly.io](https://polkadot.polkassembly.io/).

Post this **before** submitting a Treasury referendum. Use the discussion to collect feedback, answer questions, and refine scope.

Full proposal reference: [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md)

---

## Title

```
PolkAudit: Open-source governance transparency dashboard for Polkadot — Phase 1 funding discussion
```

---

## Body (copy from here)

### Summary

I'm building **PolkAudit**, an open-source governance transparency stack for Polkadot. It indexes finalized relay-chain blocks, stores an audit trail in PostgreSQL, and exposes KPIs and exports through a secured API and Next.js dashboard.

This discussion is to share the **live MVP demo**, gather community feedback, and outline a **Phase 1 treasury ask** before submitting a formal OpenGov proposal.

| | |
|---|---|
| **Ask (Phase 1)** | USD 10,000 equivalent in DOT |
| **Duration** | 8 weeks |
| **License** | Apache 2.0 |
| **Repo** | _(add GitHub URL)_ |
| **Live demo** | _(add dashboard URL)_ |
| **Demo video** | _(add video URL)_ |

---

### Problem

Polkadot OpenGov and treasury activity are public on-chain, but hard to audit in practice:

- Governance data is spread across extrinsics, pallets, and referenda.
- Explorers show raw chain data—not **governance KPIs**, **exportable audit packs**, or **indexer operational health**.
- DAOs, parachain teams, grantees, and auditors need **repeatable evidence**: blocks indexed, proposals tracked, treasury spends summarized, CSV/JSON exports.

---

### What exists today (MVP)

PolkAudit already has a working pipeline:

```text
Polkadot RPC → Indexer → PostgreSQL → FastAPI → Next.js dashboard → CSV/JSON exports
```

**Working now:**

- Live Polkadot finalized-block indexing
- Extrinsic audit trail in database
- Stats API (blocks, extrinsics, last indexed block)
- Dashboard: Overview, Proposals, Treasury, Exports, Settings
- CSV proposals export + Overview JSON export
- Hybrid deployment docs (Oracle Always Free VM indexer + Neon DB + GCP Cloud Run API/UI)

**Public demo architecture:**

```text
Oracle VM (indexer, 24/7) → Neon PostgreSQL → GCP Cloud Run (API + dashboard)
```

**Honest caveat:** Proposals, votes, and treasury KPIs only populate when matching OpenGov extrinsics appear in the scanned block range (`Referenda.submit`, `ConvictionVoting.vote`, `Treasury.spend`, etc.). The pipeline can be live while governance tables are still sparse—that is expected and documented in the UI.

---

### Evidence

| Item | Link |
|------|------|
| GitHub repository | _(add URL)_ |
| Live dashboard | _(add URL)_ |
| Demo video (3–5 min) | _(add URL)_ |
| Architecture | [docs/ARCHITECTURE.md](https://github.com/YOUR_ORG/polkaudit/blob/main/docs/ARCHITECTURE.md) |
| Hybrid deployment | [docs/HYBRID_DEPLOYMENT.md](https://github.com/YOUR_ORG/polkaudit/blob/main/docs/HYBRID_DEPLOYMENT.md) |
| Screenshots | [docs/assets/](https://github.com/YOUR_ORG/polkaudit/tree/main/docs/assets) |

Replace `YOUR_ORG/polkaudit` with your actual repo path before posting.

---

### What Phase 1 funding enables (8 weeks, ~$10k DOT)

| Milestone | Deliverable |
|-----------|-------------|
| **M1 (weeks 1–2)** | Public demo hardened; verification scripts pass; first progress report |
| **M2 (weeks 3–4)** | OpenGov parser extension + backfill tooling; governance evidence in demo range |
| **M3 (weeks 5–6)** | GitHub CI green; release `v0.1.0-mvp`; updated demo video and screenshots |
| **M4 (weeks 7–8)** | ≥ 1 pilot ecosystem team onboarded; final report and Phase 2 scope |

**Budget (USD 10,000):**

- Development: $5,500
- Infrastructure (Neon, GCP, RPC): $2,000
- Documentation & demo: $1,000
- Security & quality: $1,000
- Contingency: $500

Payment: milestone-based (25% per milestone), DOT to beneficiary address listed in the treasury referendum.

Full breakdown: [TREASURY_PROPOSAL.md](https://github.com/YOUR_ORG/polkaudit/blob/main/docs/TREASURY_PROPOSAL.md)

---

### What is NOT in Phase 1

To keep scope honest and deliverable in 8 weeks:

- Multichain indexing
- AI recommendations
- Enterprise compliance automation
- Paid managed hosting product

These may be proposed in Phase 2 if Phase 1 delivers and pilots provide feedback.

---

### Who benefits

- **Parachain / DAO treasury teams** — board-ready exports and KPIs
- **Grant recipients** — accountability evidence for milestones
- **Auditors and reviewers** — structured data instead of manual chain digging
- **Ecosystem voters** — verifiable transparency tooling funded by treasury

---

### Team

**Vijay** — Founder, Value Creating Solutions  
Maintainer and primary developer (architecture, indexer, API, dashboard, deployment).

- GitHub: _(add profile URL)_
- Contact: _(add email or Matrix)_

---

### Open-source commitment

- Apache 2.0 license
- Public GitHub repository
- No proprietary lock-in (standard PostgreSQL + HTTP API)
- Public milestone reporting on this thread

---

### Questions for the community

I'd appreciate feedback on:

1. **Scope** — Is Phase 1 (demo hardening + OpenGov parser + CI + 1 pilot) the right size for a first treasury ask?
2. **Amount** — Is USD 10k equivalent reasonable for 8 weeks of solo maintainer delivery?
3. **Pilots** — Any parachain teams, collectives, or grantees interested in a free design-partner pilot?
4. **Parser priority** — Which governance pallets or extrinsics matter most for your use case?
5. **Phase 2** — Scheduled reports, alerts, or parachain-specific indexing—which should come next?

---

### Next steps

1. Collect feedback on this discussion for **1–2 weeks**
2. Update proposal based on comments
3. Submit **Treasury spend proposal** on Polkassembly with on-chain identity and beneficiary address
4. Deliver milestones publicly if approved

Thank you for reviewing. I'm happy to answer technical questions, share architecture details, or walk through the demo live.

---

## Body (copy ends here)

---

## Posting checklist

Before you click **Create Discussion**:

See full checklist: [TREASURY_SUBMISSION_CHECKLIST.md](TREASURY_SUBMISSION_CHECKLIST.md) (Phases A–E).

- [ ] Public demo dashboard URL works in incognito browser
- [ ] GitHub repo is public
- [ ] Demo video uploaded (YouTube, Loom, or similar)
- [ ] All `_(add ...)_` placeholders replaced
- [ ] GitHub links use your real org/repo path
- [ ] Screenshots in `docs/assets/` do not show API keys or database URLs
- [ ] You can reply to comments within 24–48 hours during the discussion period

---

## After posting

1. Save the Polkassembly discussion URL → add to [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) appendix
2. Pin or link the discussion from your GitHub README (optional)
3. Reply to every comment with substance; update proposal if scope changes
4. When ready, submit Treasury referendum referencing this thread

---

## Short version (for X / Forum cross-post)

```
PolkAudit: open-source Polkadot governance transparency dashboard

Live MVP: indexer → PostgreSQL → API → dashboard + CSV/JSON exports
Hybrid deploy: Oracle VM + Neon + GCP Cloud Run

Seeking community feedback before a Phase 1 treasury ask (~$10k DOT, 8 weeks):
- Harden public demo
- Extend OpenGov parser
- CI + v0.1.0-mvp release
- 1 pilot team

Discussion: _(Polkassembly URL)_
Demo: _(dashboard URL)_
Repo: _(GitHub URL)_
```

---

*Draft aligned with [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) and [DEMO_HOSTING_GUIDE.md](DEMO_HOSTING_GUIDE.md).*
