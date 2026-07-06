# Free indexer hosting (no local Docker required)

> **Hybrid (Oracle + GCP):** Use the full playbook **[HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md)** with `deploy/oracle/setup-indexer.sh` and `cloudbuild.backend-dashboard.yaml`.

If your goal is **free** (or near-free) hosting, the best pattern is:

- Run the **backend + dashboard** on Cloud Run (can scale to zero)
- Run the **indexer** on a **free VM** (always-on worker needs a VM, not request-driven serverless)

This doc covers two free-friendly options:

- **Oracle Cloud Always Free VM** (recommended)
- **GCP Compute Engine e2-micro Always Free VM** (alternative)

## Key constraints (important)

### 1) Indexer is a long-lived worker

Your indexer keeps a WebSocket connection to Polkadot RPC and runs continuously. Cloud Run services with `min-instances=1` tend to incur charges, so for “free indexer” you want a VM instead.

### 2) Migrations / schema

The indexer does not create tables; the backend owns Alembic migrations. Before starting the indexer, ensure your database schema is migrated:

- Either run the backend once (migrations run on container start)
- Or run `alembic upgrade head` locally / on a machine with access to the DB

### 3) Neon security

Use SSL in `DATABASE_URL` (Neon requires it). If you enabled Neon IP allowlisting, you must allow the VM’s outbound IP.

## Option A (recommended): Oracle Cloud Always Free VM

### 1) Create the VM

In the Oracle Cloud Console:

- Choose the **Always Free eligible** shape (Ampere `VM.Standard.A1.Flex` is common)
- Ubuntu 22.04+ image
- Create an instance with enough RAM for Python + the indexer (your workload is usually light; 1 vCPU is typically enough for initial indexing)

### 2) Set up PolkAudit on the VM

On the VM:

```bash
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip

git clone <your-repo-url> /opt/polkaudit
cd /opt/polkaudit/apps/indexer

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3) Create `apps/indexer/.env`

Copy and edit:

```bash
cp .env.example .env
```

Set:

- `DATABASE_URL` to your Neon connection string
- `SUBSTRATE_RPC_URL` (default is fine for dev; for reliability, use a paid provider in production)

### 4) Verify the indexer starts

```bash
./run.sh
```

You should see logs like:

- `Database connection verified`
- `Starting FinalizedScanner`
- `Successfully committed block` with `extrinsics_added > 0` over time

### 5) Run 24/7 with systemd

Create a unit:

```bash
sudo tee /etc/systemd/system/polkaudit-indexer.service > /dev/null <<'EOF'
[Unit]
Description=PolkAudit Indexer
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/polkaudit/apps/indexer
ExecStart=/opt/polkaudit/apps/indexer/run.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now polkaudit-indexer.service
sudo systemctl status polkaudit-indexer.service --no-pager
```

Tail logs:

```bash
sudo journalctl -u polkaudit-indexer.service -f
```

## Option B: GCP e2-micro Always Free VM

### 1) Create a VM in a Free eligible region

For Always Free e2-micro, use one of:

- `us-west1`
- `us-central1`
- `us-east1`

Choose:

- Machine type: `e2-micro`
- Boot disk: Standard persistent disk (keep it small enough to stay under free allowances)

### 2) Follow the same setup as Oracle

Clone repo, create `apps/indexer/.env`, install requirements, then run `./run.sh`.

### 3) systemd unit

Use the same systemd unit steps as above (with your VM username, if it isn’t `ubuntu`).

## If you also deploy backend + dashboard to Cloud Run

Deployment order for first time:

1. Deploy **backend** to Cloud Run
2. Wait for migrations to complete (backend container starts with Alembic upgrade)
3. Deploy **dashboard**
4. Start the **indexer** VM

If you prefer: start indexer first (it will fail if tables don’t exist), then restart after migrations are applied.

## Quick checklist for “grant demo”

- [ ] Dashboard shows `total_blocks_indexed` and `total_extrinsics` increasing
- [ ] CSV export downloads (at least headers; proposals may remain 0 until governance calls are indexed)
- [ ] Screenshots saved to `docs/assets/`

