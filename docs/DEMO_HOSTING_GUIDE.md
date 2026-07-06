# PolkAudit Public Demo Hosting Guide

This guide is for the first public PolkAudit demo used in Polkadot / Polkassembly discussion.

The goal is not a fully commercial SaaS launch yet. The goal is a credible public URL that proves:

- Live Polkadot finalized blocks are being indexed.
- Data is stored in Neon PostgreSQL.
- The FastAPI backend serves health, stats, and exports.
- The Next.js dashboard can be opened by reviewers, ecosystem members, and potential pilot clients.
- No private keys, database URLs, or service credentials are exposed.

---

## Recommended demo architecture

Use the existing hybrid deployment:

```text
Polkadot RPC
    |
    v
Oracle Always Free VM
    - runs the indexer 24/7
    - stores secrets in /etc/polkaudit/indexer.env
    |
    v
Neon PostgreSQL
    - shared database
    - SSL required
    |
    v
GCP Cloud Run
    - polkaudit-backend
    - polkaudit-dashboard
```

Reference docs:

- [HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md)
- [GCP_CLOUD_BUILD.md](GCP_CLOUD_BUILD.md)
- [INDEXER_FREE_HOSTING.md](INDEXER_FREE_HOSTING.md)

---

## Public demo naming

Recommended public names:

- Product: `PolkAudit`
- Demo URL: `https://demo.<your-domain>`
- Backend URL: keep the Cloud Run URL private unless needed for API docs
- Discussion title: `PolkAudit: live governance and treasury audit dashboard for Polkadot`

If you do not yet own a domain, use the Cloud Run dashboard URL for the first discussion. A custom domain helps credibility but is not required for the first public post.

---

## Pre-launch checklist

### 1. Repository readiness

- [ ] Repository is public.
- [ ] `LICENSE` is present.
- [ ] `README.md` explains what the project does.
- [ ] `docs/assets/` contains current screenshots and sample exports.
- [ ] `.env`, `.env.local`, production env files, database URLs, API keys, and cloud credentials are not committed.
- [ ] Run `git status` and verify no private file is staged.

### 2. Database readiness

- [ ] Neon database is created.
- [ ] `DATABASE_URL` uses SSL, usually `?sslmode=require`.
- [ ] Backend migrations have run.
- [ ] If Neon IP allowlisting is enabled, Oracle VM outbound IP is allowlisted.

### 3. Backend and dashboard readiness

- [ ] GCP Secret Manager has `polkaudit-database-url`.
- [ ] GCP Secret Manager has `polkaudit-api-key`.
- [ ] Cloud Run backend deploy succeeds.
- [ ] Cloud Run dashboard deploy succeeds.
- [ ] Dashboard was built with the correct backend API URL.
- [ ] Public dashboard loads without local-only configuration.

### 4. Indexer readiness

- [ ] Oracle VM has the repo cloned under `/opt/polkaudit`.
- [ ] Indexer secrets live in `/etc/polkaudit/indexer.env`, not in the repo.
- [ ] `polkaudit-indexer` systemd service is enabled.
- [ ] Indexer logs show `Database connection verified`.
- [ ] Indexer logs show `Successfully committed block`.

---

## Deployment order

### Step 1: prepare Neon

Create the Neon project and copy the pooled or direct database URL. Use the async format expected by the backend/indexer environment:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require
```

Keep this value private.

### Step 2: create GCP secrets

Store secrets in Secret Manager. Do not place them in GitHub Actions variables, docs, screenshots, or public issue comments.

Suggested secret names:

```text
polkaudit-database-url
polkaudit-api-key
```

Use a strong random API key for the demo. Rotate it if it was ever pasted into chat, screenshots, terminal output, or docs.

### Step 3: deploy backend and dashboard

Use:

```bash
gcloud builds submit --config=cloudbuild.backend-dashboard.yaml \
  --substitutions=_REGION=asia-southeast1,_API_KEY=your-production-api-key
```

After deploy, save the Cloud Run URLs:

```bash
gcloud run services describe polkaudit-backend \
  --region=asia-southeast1 --format='value(status.url)'

gcloud run services describe polkaudit-dashboard \
  --region=asia-southeast1 --format='value(status.url)'
```

### Step 4: start the Oracle indexer

On the Oracle VM:

```bash
cd /opt/polkaudit
sudo bash deploy/oracle/setup-indexer.sh --skip-clone
sudo nano /etc/polkaudit/indexer.env
sudo systemctl restart polkaudit-indexer
sudo journalctl -u polkaudit-indexer -f
```

Use a recent `INDEXER_START_BLOCK` for the first demo so reviewers quickly see block and extrinsic counts increasing.

Example:

```env
SUBSTRATE_RPC_URL=wss://rpc.polkadot.io
INDEXER_START_BLOCK=31387000
INDEXER_CATCHUP_WINDOW=2000
```

### Step 5: verify the public demo

From your laptop:

```bash
export BACKEND_URL=https://your-backend-url.run.app
export API_KEY=your-production-api-key

./scripts/hybrid-verify.sh
```

Manual checks:

- Dashboard opens in a private/incognito browser window.
- Overview page shows live status.
- `total_blocks_indexed` and `total_extrinsics` grow over time.
- CSV export downloads.
- Empty proposal or treasury rows are explained as normal if no matching governance extrinsics were indexed in the current window.

---

## What to show in the public discussion

Use the public dashboard URL and avoid sharing private backend/API details.

Recommended evidence:

- Public dashboard URL.
- GitHub repo URL.
- 3-5 minute demo video.
- Screenshots from `docs/assets/`.
- Sample JSON overview export.
- Sample CSV export.
- Short architecture explanation: Oracle VM indexer + Neon + GCP Cloud Run.

Do not share:

- `DATABASE_URL`
- API key
- GCP project IDs if you do not want them public
- Oracle VM IP if not necessary
- Service account JSON
- Raw terminal screenshots containing secrets

---

## Demo narrative

Use this concise framing:

> PolkAudit is a live governance transparency dashboard for Polkadot. It indexes finalized blocks, stores audit-ready governance records in PostgreSQL, and exposes dashboards and exports for treasury teams, grantees, auditors, and ecosystem participants. This demo is an MVP: it proves the live data pipeline, API, dashboard, and export flow. The next phase is stronger OpenGov coverage, scheduled reports, alerts, and pilot onboarding.

---

## Maintenance during discussion

Check once or twice daily while the discussion is active:

```bash
sudo systemctl status polkaudit-indexer --no-pager
sudo journalctl -u polkaudit-indexer -n 100 --no-pager
```

Backend/dashboard:

- Check Cloud Run logs.
- Confirm Neon storage and compute limits.
- Confirm dashboard still loads publicly.
- Rotate the API key if it appears in public.

---

## If something breaks

| Symptom | Likely cause | First action |
|---------|--------------|--------------|
| Dashboard loads but stats are zero | Indexer stopped or wrong DB | Check Oracle `systemctl` logs |
| Backend returns 401 | API key mismatch | Compare GCP secret and dashboard build substitution |
| Backend cannot connect to DB | Neon URL/SSL/IP allowlist | Check Secret Manager value and Neon network settings |
| Indexer commits blocks but proposals are zero | No governance extrinsics in scanned window | Explain this in discussion and widen the scan window |
| Cloud Run deploy works but dashboard calls old API URL | Dashboard was built with old env | Rebuild dashboard via Cloud Build |

---

## Launch sequence

1. Deploy backend/dashboard.
2. Start indexer.
3. Verify stats and exports.
4. Record demo video.
5. Update screenshots and sample exports.
6. Push public repo.
7. Open Polkassembly / Polkadot Forum discussion.
8. Reply to questions with demo evidence and roadmap.

