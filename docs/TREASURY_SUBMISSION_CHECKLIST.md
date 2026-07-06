# PolkAudit — Treasury Submission Checklist

Use this list before posting on Polkassembly and before submitting a Treasury referendum.  
Full proposal: [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md)  
Discussion draft: [POLKASSEMBLY_DISCUSSION_POST.md](POLKASSEMBLY_DISCUSSION_POST.md)

---

## Phase A — Public demo (before any Polkassembly post)

Follow [DEMO_HOSTING_GUIDE.md](DEMO_HOSTING_GUIDE.md) and [PUBLIC_PRIVATE_REPO_GUIDE.md](PUBLIC_PRIVATE_REPO_GUIDE.md).

### Infrastructure

- [ ] Neon database created; `DATABASE_URL` uses `?sslmode=require`
- [ ] GCP Secret Manager: `polkaudit-database-url`, `polkaudit-api-key`
- [ ] Backend deployed to Cloud Run (`cloudbuild.backend-dashboard.yaml`)
- [ ] Dashboard deployed to Cloud Run (built with correct backend API URL)
- [ ] Oracle VM indexer running via `polkaudit-indexer` systemd service
- [ ] Indexer secrets in `/etc/polkaudit/indexer.env` only (not in repo)
- [ ] Neon IP allowlist includes Oracle VM outbound IP (if enabled)

### Verification

- [ ] `./scripts/hybrid-verify.sh` passes against public backend URL
- [ ] Dashboard opens in **incognito** browser (no local `.env` required)
- [ ] `total_blocks_indexed` and `total_extrinsics` increase over 30+ minutes
- [ ] CSV export downloads from public dashboard
- [ ] Overview JSON export works from Exports page
- [ ] API key not visible in screenshots, video, or page source

### Secret hygiene

- [ ] No `.env` files committed
- [ ] `git status` clean of `private/`, `secrets/`, credentials
- [ ] Run secret scan: `rg -n "DATABASE_URL|API_KEY|neon.tech|BEGIN .* KEY|service_account" .` — only safe placeholders
- [ ] Rotate API key if it ever appeared in chat, terminal recording, or docs

---

## Phase B — Repository (public credibility)

- [ ] All MVP code pushed to **public** GitHub
- [ ] Meaningful commit history (not a single dump commit)
- [ ] [LICENSE](../LICENSE) present (Apache 2.0)
- [ ] README quick-start accurate (`apps/frontend` as canonical UI)
- [ ] GitHub Actions CI: indexer pytest, backend tests, frontend build
- [ ] Tag `v0.1.0-mvp` with release notes _(can be after discussion; before referendum is ideal)_

---

## Phase C — Documentation package

- [ ] [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) — complete; payment fields filled before referendum
- [ ] [TREASURY_SUMMARY.md](TREASURY_SUMMARY.md) — one-page overview for voters
- [ ] [POLKASSEMBLY_DISCUSSION_POST.md](POLKASSEMBLY_DISCUSSION_POST.md) — placeholders replaced
- [ ] [TREASURY_REVIEWER_FAQ.md](TREASURY_REVIEWER_FAQ.md) — ready for comment replies
- [ ] [DEMO_SCRIPT.md](DEMO_SCRIPT.md) — matches live public demo
- [ ] [HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md) — deployment path documented
- [ ] [WEEKLY_REPORT.md](WEEKLY_REPORT.md) — recent progress with dates

---

## Phase D — Demo assets

- [ ] `docs/assets/overview.png`
- [ ] `docs/assets/proposals.png`
- [ ] `docs/assets/treasury.png`
- [ ] `docs/assets/exports.png`
- [ ] `docs/assets/settings.png`
- [ ] `docs/assets/sample-overview.json`
- [ ] `docs/assets/sample-proposals.csv`
- [ ] **Demo video** (3–5 min, YouTube or Loom) — link in proposal + discussion
- [ ] Screenshots reviewed: no API keys, DB URLs, or private GCP project IDs

---

## Phase E — Polkassembly Discussion (post first)

- [ ] Polkassembly account created / logged in
- [ ] On-chain identity linked (recommended before or with discussion)
- [ ] Discussion title matches [POLKASSEMBLY_DISCUSSION_POST.md](POLKASSEMBLY_DISCUSSION_POST.md)
- [ ] All `_(add ...)_` placeholders replaced in post body
- [ ] GitHub links use real org/repo path
- [ ] Live demo URL included
- [ ] Demo video URL included
- [ ] Discussion URL saved → add to [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) appendix
- [ ] Cross-post short version to Polkadot Forum / X (optional)
- [ ] Commit to reply to comments within 24–48 hours for 1–2 weeks

---

## Phase F — Treasury referendum (after discussion feedback)

Do **not** submit until discussion feedback is incorporated (or explicitly addressed).

### On-chain requirements

- [ ] Polkadot on-chain identity registered and linked on Polkassembly
- [ ] Beneficiary **DOT address** chosen (cold wallet or dedicated treasury wallet)
- [ ] Amount set: **USD 10,000 equivalent in DOT** (use Polkassembly/Treasury calculator at submission time)
- [ ] Correct OpenGov track selected for spend size
- [ ] Milestone payment schedule stated (25% × 4 milestones)

### Referendum content

- [ ] Problem + solution (from [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) §2–3)
- [ ] Phase 1 deliverables table — **MVP only**
- [ ] 8-week milestone table
- [ ] Budget breakdown ($10,000)
- [ ] Team bio + contact links
- [ ] Link to **Discussion thread**
- [ ] Link to **public GitHub**
- [ ] Link to **live demo** + **demo video**
- [ ] Open-source license stated (Apache 2.0)
- [ ] Honest caveat: governance KPIs may be sparse in short scan windows

### Post-submission

- [ ] Referendum URL saved in [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) appendix
- [ ] README updated: “Treasury referendum submitted — [date]”
- [ ] Prepare answers using [TREASURY_REVIEWER_FAQ.md](TREASURY_REVIEWER_FAQ.md)
- [ ] Engage voters who comment or ask questions on Polkassembly

---

## Phase G — Honesty review (required)

- [ ] No multichain / AI / scoring features listed as **completed** deliverables
- [ ] Governance empty-state documented if proposals still zero
- [ ] Success metrics match **8-week** solo-maintainer capacity
- [ ] Budget is **$10,000** for Phase 1 (not a larger figure)
- [ ] Phase 2 items clearly separated from Phase 1 ask
- [ ] No private repo claims while asking for public treasury funds

---

## Phase H — Post-approval (if referendum passes)

- [ ] Milestone M1 delivered + public report within weeks 1–2
- [ ] Bi-weekly progress updates on Polkassembly discussion thread
- [ ] Milestones M2–M4 delivered on schedule
- [ ] Final report published in repo (`docs/WEEKLY_REPORT.md` or dedicated close-out doc)
- [ ] Phase 2 scope drafted based on pilot feedback

---

## Quick commands before Discussion post

```bash
# Local / hybrid verification
export BACKEND_URL=https://your-backend-url.run.app
export API_KEY=your-production-api-key
./scripts/hybrid-verify.sh

make verify-e2e
make check-governance

# Asset check
ls -la docs/assets/*.png docs/assets/sample-*

# Build sanity
pytest apps/indexer/tests/ -q
cd apps/frontend && npm run build

# Secret scan (review output manually)
rg -n "DATABASE_URL|API_KEY|SECRET|PASSWORD|neon.tech|service_account" .
```

---

## Timeline (suggested)

| Week | Action |
|------|--------|
| 1 | Deploy public demo; push GitHub; record video |
| 2 | Post Polkassembly Discussion; share demo links |
| 3–4 | Collect feedback; answer questions; refine proposal |
| 5 | Submit Treasury referendum (if feedback is positive) |
| 6+ | Campaign for votes; deliver milestones if approved |

---

## Placeholder tracker

Fill these once and copy into all docs:

| Field | Value |
|-------|-------|
| GitHub repo | |
| GitHub profile | |
| Live dashboard URL | |
| Demo video URL | |
| Contact (email/Matrix) | |
| Polkassembly discussion URL | |
| Treasury referendum URL | |
| On-chain identity | |
| Beneficiary DOT address | |

---

*Last updated: 2026-05-28*
