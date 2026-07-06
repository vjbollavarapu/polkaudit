#!/usr/bin/env bash
# Bootstrap PolkAudit indexer on Oracle Cloud (Always Free) VM.
# Hybrid: indexer on Oracle + backend/dashboard on GCP Cloud Run + Neon DB.
#
# Usage (on the VM, as root or with sudo):
#   sudo bash deploy/oracle/setup-indexer.sh
#   sudo bash deploy/oracle/setup-indexer.sh --skip-clone   # repo already at /opt/polkaudit
#   sudo bash deploy/oracle/setup-indexer.sh --repo-url https://github.com/you/polkaudit.git
#
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/polkaudit}"
REPO_URL="${REPO_URL:-}"
SKIP_CLONE=0
ENV_FILE="/etc/polkaudit/indexer.env"
SERVICE_NAME="polkaudit-indexer"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-clone) SKIP_CLONE=1; shift ;;
    --repo-url) REPO_URL="$2"; shift 2 ;;
    --install-dir) INSTALL_DIR="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: sudo $0 [--skip-clone] [--repo-url URL] [--install-dir /opt/polkaudit]"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

# OCI Ubuntu → ubuntu; Oracle Linux → opc
RUN_USER="${SUDO_USER:-ubuntu}"
if id opc &>/dev/null && [[ ! -d "/home/ubuntu" ]]; then
  RUN_USER=opc
fi

echo "== PolkAudit Oracle indexer setup =="
echo "Install dir: $INSTALL_DIR"
echo "Service user: $RUN_USER"

apt-get update -qq
apt-get install -y -qq git python3 python3-venv python3-pip curl

if [[ "$SKIP_CLONE" -eq 0 ]]; then
  if [[ -z "$REPO_URL" ]]; then
    if [[ -f "$(dirname "$0")/../../apps/indexer/run.sh" ]]; then
      SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
      echo "Using existing repo at $SCRIPT_DIR"
      if [[ "$SCRIPT_DIR" != "$INSTALL_DIR" ]]; then
        mkdir -p "$(dirname "$INSTALL_DIR")"
        rm -rf "$INSTALL_DIR"
        cp -a "$SCRIPT_DIR" "$INSTALL_DIR"
        chown -R "$RUN_USER:$RUN_USER" "$INSTALL_DIR"
      fi
    else
      echo "ERROR: Set --repo-url or clone repo to $INSTALL_DIR first"
      exit 1
    fi
  else
    echo "Cloning $REPO_URL -> $INSTALL_DIR"
    rm -rf "$INSTALL_DIR"
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
    chown -R "$RUN_USER:$RUN_USER" "$INSTALL_DIR"
  fi
fi

if [[ ! -f "$INSTALL_DIR/apps/indexer/run.sh" ]]; then
  echo "ERROR: $INSTALL_DIR/apps/indexer/run.sh not found"
  exit 1
fi

INDEXER_DIR="$INSTALL_DIR/apps/indexer"
cd "$INDEXER_DIR"

echo "Creating Python venv..."
sudo -u "$RUN_USER" python3 -m venv venv
sudo -u "$RUN_USER" venv/bin/pip install -q --upgrade pip
sudo -u "$RUN_USER" venv/bin/pip install -q -r requirements.txt

echo "Verifying substrate-interface..."
if ! sudo -u "$RUN_USER" venv/bin/python -c \
  "from substrateinterface import SubstrateInterface; assert hasattr(SubstrateInterface, 'decode_scale')"; then
  echo "ERROR: Wrong substrate package. Fixing..."
  sudo -u "$RUN_USER" venv/bin/pip uninstall -y substrateinterface 2>/dev/null || true
  sudo -u "$RUN_USER" venv/bin/pip install -q -r requirements.txt
fi
echo "OK: substrate-interface"

mkdir -p /etc/polkaudit
if [[ ! -f "$ENV_FILE" ]]; then
  cp "$INSTALL_DIR/deploy/oracle/indexer.env.example" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo ""
  echo "*** EDIT $ENV_FILE with your Neon DATABASE_URL, then:"
  echo "    sudo systemctl restart $SERVICE_NAME"
  echo ""
else
  echo "Keeping existing $ENV_FILE"
fi

# systemd unit
sed "s/^User=ubuntu/User=$RUN_USER/; s/^Group=ubuntu/Group=$RUN_USER/" \
  "$INSTALL_DIR/deploy/oracle/polkaudit-indexer.service" \
  > "/etc/systemd/system/${SERVICE_NAME}.service"

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

if grep -q 'USER:PASSWORD@HOST' "$ENV_FILE" 2>/dev/null; then
  echo "WARNING: $ENV_FILE still has placeholder values — service not started."
  echo "Edit: sudo nano $ENV_FILE"
  echo "Then: sudo systemctl start $SERVICE_NAME"
else
  systemctl restart "$SERVICE_NAME" || systemctl start "$SERVICE_NAME"
  sleep 2
  systemctl status "$SERVICE_NAME" --no-pager || true
fi

echo ""
echo "== Setup complete =="
echo "Logs:    sudo journalctl -u $SERVICE_NAME -f"
echo "Neon IP: curl -s https://ifconfig.me  (add to Neon allowlist if enabled)"
echo "Hybrid:  deploy GCP with cloudbuild.backend-dashboard.yaml"
echo "Verify:  ./scripts/hybrid-verify.sh (from laptop, with BACKEND_URL set)"
