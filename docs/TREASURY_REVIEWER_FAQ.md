# PolkAudit — Treasury Voter FAQ

Answers for Polkadot OpenGov voters, Polkassembly commenters, and technical due diligence.

---

## General

### What is PolkAudit?

An open-source governance transparency platform for Polkadot. It indexes finalized relay-chain blocks, stores governance-related extrinsics in PostgreSQL, and serves KPIs and exports through a REST API and Next.js dashboard.

### Why Polkadot Treasury?

Polkadot ecosystem funding for open-source tooling is delivered through **OpenGov Treasury** proposals with public discussion on Polkassembly. PolkAudit is requesting Phase 1 support through that process after publishing a live demo and gathering community feedback.

### Why Polkadot relay chain first?

Polkadot OpenGov and treasury activity on the relay chain are the highest-impact starting point for ecosystem-wide transparency. Parachain-specific indexing is Phase 2 roadmap.

### Is this production-ready?

It is an **MVP** suitable for demos, pilots, and treasury-funded hardening—not a certified audit product. See honest scope in [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md).

### Why only $10,000 for Phase 1?

A focused 8-week ask builds trust with voters. Phase 1 delivers a hardened public demo, OpenGov parser improvements, CI/release, and one pilot—not a full enterprise platform. A larger Phase 2 can follow if Phase 1 delivers.

---

## Technical

### How is data ingested?

The indexer (`apps/indexer`) connects to a Polkadot RPC endpoint, walks **finalized** blocks sequentially, decodes extrinsics with `substrate-interface`, and writes rows to PostgreSQL. Progress is tracked in `processed_blocks`.

### Why are proposals/votes sometimes zero?

Governance KPIs only increase when indexed blocks contain matching calls (`Referenda.submit`, `ConvictionVoting.vote`, `Treasury.spend`, etc.). A short scan window may contain **no** such extrinsics even while blocks and extrinsics counts grow. This is expected—not a broken pipeline.

### What schema owns the database?

**Backend Alembic migrations** (`apps/backend/migrations`) are the source of truth. Run `alembic upgrade head` before starting the indexer.

### How do I verify indexing works?

```bash
export BACKEND_URL=https://your-public-backend-url.run.app
export API_KEY=your-api-key
./scripts/hybrid-verify.sh
```

Or locally:

```bash
make verify-e2e
make check-governance
```

Expect `total_blocks_indexed` and `total_extrinsics` > 0.

### Does the indexer use events or extrinsics?

**Extrinsics** today. Event-based parsing for richer referendum lifecycle is planned for Phase 1/2.

### What RPC do you use?

Default: public `wss://rpc.polkadot.io`. Production demo uses a dedicated provider (OnFinality, etc.) when rate limits matter.

---

## Deployment

### What is the hybrid deployment?

- **Oracle Always Free VM** — runs indexer 24/7 at ~$0
- **Neon PostgreSQL** — shared database
- **GCP Cloud Run** — backend + frontend API/UI

Documented in [HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md) and [DEMO_HOSTING_GUIDE.md](DEMO_HOSTING_GUIDE.md).

### Is there a public demo URL?

Add your Cloud Run URL to [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) before posting. Voters should be able to open the dashboard without local setup.

### Can voters run this locally?

Yes — see root [README.md](../README.md) or `make dev` (Docker Compose).

---

## Security & data

### What data is stored?

Only **public blockchain data** (block headers, decoded extrinsics, derived governance/treasury records). No private user data.

### How is the API secured?

`X-API-KEY` header on `/api/v1/*` routes. Keys via GCP Secret Manager and environment variables—not committed to the repo.

### Are secrets in the repository?

No `.env` files should be committed. See [PUBLIC_PRIVATE_REPO_GUIDE.md](PUBLIC_PRIVATE_REPO_GUIDE.md). Rotate any credentials that were ever shared.

### If the code is open source, can't anyone copy it?

Yes. Apache 2.0 allows forks. Treasury funds **execution, maintenance, and ecosystem trust**—not secrecy. Differentiation comes from the live demo, milestone delivery, and pilot relationships.

---

## Treasury scope honesty

### What is **not** included in Phase 1?

- Multichain adapters
- AI recommendations
- Slack/Discord notifications (code exists; not Phase 1 deliverable)
- Governance scoring / forecasting engines
- Full historical chain backfill (millions of blocks)
- Paid managed hosting product launch

### What will USD 10,000 fund?

8 weeks: public demo hardening, OpenGov parser coverage, CI/release, documentation, one pilot onboarding. See budget in [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md).

### How are milestones paid?

25% per milestone ($2,500 equivalent in DOT) upon public completion report on the Polkassembly discussion thread.

### Who maintains the project?

Founder-led (Vijay). Treasury proposal acknowledges solo-maintainer bandwidth risk with strict Phase 1 scope and bi-weekly public reports.

---

## Commercial model (post-Phase 1)

Treasury Phase 1 is **open-source infrastructure**, not a SaaS launch. After Phase 1, optional paid pilots ($500–$1,500/3 months) and managed hosting ($99–$799/month) may sustain operations without conflicting with the open-source commitment.

---

## Troubleshooting for voters

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Dashboard all zeros | Indexer stopped | Check Oracle VM `systemctl status polkaudit-indexer` |
| API 401 | API key mismatch | Dashboard build vs GCP secret |
| Governance KPIs zero | No matching extrinsics in scan window | Expected; verify blocks/extrinsics grow |
| `extrinsics_added: 0` | Wrong substrate package | Reinstall from `requirements.txt` on VM |
| Slow catch-up | Public RPC limits | Dedicated RPC; adjust `INDEXER_START_BLOCK` |

---

## Contact

Open a GitHub issue in the public repository or contact the maintainer (add email/Matrix in [TREASURY_PROPOSAL.md](TREASURY_PROPOSAL.md) before submission).

Polkassembly discussion: _(add URL after posting)_
