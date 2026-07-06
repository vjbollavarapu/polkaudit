# Oracle Cloud — indexer (hybrid deployment)

Run only the **indexer** on Oracle Always Free. Pair with:

- **GCP Cloud Run** — backend + dashboard (`cloudbuild.backend-dashboard.yaml`)
- **Neon** — PostgreSQL

Full guide: [docs/HYBRID_DEPLOYMENT.md](../../docs/HYBRID_DEPLOYMENT.md)

## Quick start (on the VM)

```bash
git clone https://github.com/YOUR_ORG/polkaudit.git /opt/polkaudit
cd /opt/polkaudit
sudo bash deploy/oracle/setup-indexer.sh --skip-clone
sudo nano /etc/polkaudit/indexer.env   # Neon DATABASE_URL
sudo systemctl restart polkaudit-indexer
sudo journalctl -u polkaudit-indexer -f
```

## Files

| File | Purpose |
|------|---------|
| `setup-indexer.sh` | Install deps, venv, systemd |
| `polkaudit-indexer.service` | systemd unit (patched for `ubuntu`/`opc`) |
| `indexer.env.example` | Template for `/etc/polkaudit/indexer.env` |
