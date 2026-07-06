# Hybrid deployment: Oracle (indexer) + GCP (API/UI) + Neon (DB)

**Recommended production-style layout for $0–low cost:**

```text
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  Oracle Always Free │     │   Neon PostgreSQL    │     │  GCP Cloud Run      │
│  VM (indexer)       │────▶│   (shared database)  │◀────│  backend + dashboard│
│  wss → Polkadot RPC │     │                      │     │  (public HTTPS)     │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
```

| Component | Platform | Cost profile |
|-----------|----------|--------------|
| **Indexer** | Oracle Cloud `VM.Standard.A1.Flex` (Always Free) | $0 |
| **Database** | Neon | Free tier / existing |
| **Backend API** | GCP Cloud Run | Scales to zero, low traffic ≈ $0 |
| **Dashboard** | GCP Cloud Run | Same |

No Docker required on your laptop. Cloud Build builds images; Oracle VM runs `./run.sh` via systemd.

---

## Before you start (checklist)

| # | Task | Where |
|---|------|--------|
| 1 | Neon project + `DATABASE_URL` with `?sslmode=require` | [neon.tech](https://neon.tech) |
| 2 | GCP project + APIs enabled + Artifact Registry | [docs/GCP_CLOUD_BUILD.md](GCP_CLOUD_BUILD.md) |
| 3 | Secret Manager: `polkaudit-database-url`, `polkaudit-api-key` | GCP Console |
| 4 | Oracle Cloud account + Always Free VM provisioned | OCI Console |
| 5 | Same `API_KEY` everywhere (GCP secret + dashboard build + local tests) | — |

---

## Part 1 — GCP: backend + dashboard only

Use **`cloudbuild.backend-dashboard.yaml`** (not full `cloudbuild.yaml` — that deploys a paid always-on indexer on Cloud Run).

### Cloud Build trigger

1. **Cloud Build** → **Triggers** → **Create trigger**
2. Repo: `polkaudit`, branch: `main`
3. Config file: **`cloudbuild.backend-dashboard.yaml`**
4. Substitutions (example):

| Variable | Value |
|----------|--------|
| `_REGION` | `asia-southeast1` (or your region) |
| `_API_KEY` | Same as `polkaudit-api-key` secret |

### Manual deploy

```bash
gcloud builds submit --config=cloudbuild.backend-dashboard.yaml \
  --substitutions=_REGION=asia-southeast1,_API_KEY=your-production-api-key
```

### Save URLs

After the build:

```bash
export BACKEND_URL=$(gcloud run services describe polkaudit-backend \
  --region=asia-southeast1 --format='value(status.url)')

export DASHBOARD_URL=$(gcloud run services describe polkaudit-dashboard \
  --region=asia-southeast1 --format='value(status.url)')

echo "Backend:   $BACKEND_URL"
echo "Dashboard: $DASHBOARD_URL"
```

Verify backend (migrations run on container start):

```bash
curl -s "$BACKEND_URL/health"
curl -s -H "X-API-KEY: your-production-api-key" \
  "$BACKEND_URL/api/v1/stats/overview" | python3 -m json.tool
```

---

## Part 2 — Oracle: indexer VM

### 2.1 Create the VM (OCI Console)

| Setting | Recommended |
|---------|-------------|
| **Shape** | Ampere `VM.Standard.A1.Flex` (Always Free) |
| **OCPUs / RAM** | 1 OCPU, 6 GB (leave headroom for 4 OCPU pool) or 2/12 if capacity allows |
| **Image** | Ubuntu 22.04 or 24.04 |
| **Boot volume** | 50–100 GB (within 200 GB free pool) |
| **SSH** | Your public key |
| **Public IP** | Assign (needed for SSH; indexer does not need inbound ports for MVP) |

**“Out of host capacity”:** Try another availability domain, a different home region, or retry later. Common on Always Free ARM.

**Networking:** Default VCN is fine. You do **not** need to open port 8001 to the internet for the grant demo (indexer only talks outbound to Neon + Polkadot RPC).

### 2.2 SSH into the VM

```bash
ssh ubuntu@<ORACLE_VM_PUBLIC_IP>
# Oracle Linux images may use: ssh opc@<IP>
```

### 2.3 Run the automated setup script

From your **local machine** (repo cloned) or copy script to VM:

**Option A — clone repo on VM, run script from repo:**

```bash
# On the Oracle VM
sudo apt-get update
sudo apt-get install -y git

git clone https://github.com/YOUR_ORG/polkaudit.git /opt/polkaudit
cd /opt/polkaudit
sudo bash deploy/oracle/setup-indexer.sh
```

**Option B — already cloned, re-run updates:**

```bash
cd /opt/polkaudit
git pull
sudo bash deploy/oracle/setup-indexer.sh --skip-clone
```

The script will:

- Install Python 3 + venv dependencies
- Verify `substrate-interface` (not the broken stub)
- Create `/etc/polkaudit/indexer.env` from template (you edit secrets there)
- Install and enable `polkaudit-indexer` systemd service

### 2.4 Configure secrets on the VM

Edit (root-only):

```bash
sudo nano /etc/polkaudit/indexer.env
```

```env
DATABASE_URL=postgresql+asyncpg://USER:PASS@HOST.neon.tech/neondb?sslmode=require
SUBSTRATE_RPC_URL=wss://rpc.polkadot.io
LOG_LEVEL=INFO
METRICS_PORT=8001
RETRY_DELAY_SECONDS=2
INDEXER_START_BLOCK=31387000
INDEXER_CATCHUP_WINDOW=2000
```

**Neon IP allowlist:** If enabled in Neon, add the VM’s public IP:

```bash
curl -s https://ifconfig.me
```

Paste that IP in Neon → Project → Settings → **Network security**.

Restart indexer:

```bash
sudo systemctl restart polkaudit-indexer
sudo journalctl -u polkaudit-indexer -f
```

Healthy logs:

```json
{"event": "Database connection verified"}
{"event": "Successfully committed block", "extrinsics_added": 2, "governance_added": 0}
```

---

## Part 3 — End-to-end verification

From your laptop (replace URLs and key):

```bash
export BACKEND_URL=https://polkaudit-backend-xxxxx.run.app
export API_KEY=your-production-api-key

./scripts/hybrid-verify.sh
```

Or open the **dashboard** Cloud Run URL in a browser. Expect:

- **Blocks indexed / extrinsics** increasing (indexer + Neon + backend)
- **Proposals** may stay `0` until governance extrinsics appear

---

## Deployment order (first time)

```text
1. Neon database exists
2. GCP: cloudbuild.backend-dashboard.yaml  →  migrations on backend start
3. Oracle: setup-indexer.sh + indexer.env + systemctl start
4. hybrid-verify.sh + dashboard UI check
```

---

## Operations

| Action | Command (Oracle VM) |
|--------|---------------------|
| Status | `sudo systemctl status polkaudit-indexer` |
| Logs | `sudo journalctl -u polkaudit-indexer -f` |
| Restart | `sudo systemctl restart polkaudit-indexer` |
| Stop | `sudo systemctl stop polkaudit-indexer` |
| Update code | `cd /opt/polkaudit && git pull && sudo bash deploy/oracle/setup-indexer.sh --skip-clone` |

| Action | GCP |
|--------|-----|
| Redeploy API/UI | Push to `main` or re-run Cloud Build trigger |
| View logs | Cloud Run → service → Logs |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Indexer: DB connection failed | Check `DATABASE_URL`, Neon SSL, IP allowlist |
| Indexer: `extrinsics_added: 0` | Wrong package: `pip uninstall substrateinterface`; reinstall `requirements.txt` |
| Backend stats all zero | Indexer not running or wrong Neon DB |
| Dashboard 401 | `API_KEY` mismatch vs GCP secret / `_API_KEY` substitution |
| Dashboard can’t reach API | Rebuild dashboard after backend URL change |
| OCI “Out of capacity” | Other AD/region or retry |

---

## Files reference

| Path | Purpose |
|------|---------|
| [cloudbuild.backend-dashboard.yaml](../cloudbuild.backend-dashboard.yaml) | GCP: backend + dashboard only |
| [deploy/oracle/setup-indexer.sh](../deploy/oracle/setup-indexer.sh) | Oracle VM bootstrap |
| [deploy/oracle/polkaudit-indexer.service](../deploy/oracle/polkaudit-indexer.service) | systemd unit template |
| [deploy/oracle/indexer.env.example](../deploy/oracle/indexer.env.example) | Env template → `/etc/polkaudit/indexer.env` |
| [scripts/hybrid-verify.sh](../scripts/hybrid-verify.sh) | Post-deploy checks |
| [docs/GCP_CLOUD_BUILD.md](GCP_CLOUD_BUILD.md) | GCP secrets, IAM, triggers |

---

## Grant / demo narrative

> PolkAudit uses a **hybrid cloud architecture**: the always-on Polkadot block indexer runs on Oracle Cloud Always Free compute, while the public API and dashboard are serverless on Google Cloud Run, with audit data in Neon PostgreSQL. This minimizes cost while keeping a live governance transparency pipeline.
