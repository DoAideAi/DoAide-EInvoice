#!/usr/bin/env bash
set -euo pipefail

SERVER="root@89.167.8.178"
SSH_KEY="/Users/dev/projects/keys/hetzner_deploy_ed25519"
SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=no"
RSYNC="rsync -avz --delete -e 'ssh -i $SSH_KEY -o StrictHostKeyChecking=no'"
REMOTE_DIR="/opt/DoAide-EInvoice"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== DoAide E-Invoice Deploy ==="

# Step 1: Build frontend locally
echo "[1/7] Building frontend..."
cd "$LOCAL_DIR/frontend"
npm ci --silent
npm run build

# Step 2: Sync backend
echo "[2/7] Syncing backend..."
eval $RSYNC --exclude='.venv' --exclude='__pycache__' --exclude='.env' --exclude='*.db' \
    "$LOCAL_DIR/backend/" "$SERVER:$REMOTE_DIR/backend/"

# Step 3: Sync frontend dist
echo "[3/7] Syncing frontend dist..."
eval $RSYNC "$LOCAL_DIR/frontend/dist/" "$SERVER:$REMOTE_DIR/frontend/dist/"
eval $RSYNC "$LOCAL_DIR/frontend/package.json" "$SERVER:$REMOTE_DIR/frontend/package.json"

# Step 4: Setup Python venv on server
echo "[4/7] Setting up Python venv..."
$SSH $SERVER "cd $REMOTE_DIR/backend && python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt"

# Step 5: Copy systemd services
echo "[5/7] Installing systemd services..."
$SSH $SERVER "cp $REMOTE_DIR/deploy/einvoice-api.service /etc/systemd/system/ && cp $REMOTE_DIR/deploy/einvoice-web.service /etc/systemd/system/ && systemctl daemon-reload"

# Step 6: Sync deploy files
echo "[6/7] Syncing deploy configs..."
eval $RSYNC "$LOCAL_DIR/deploy/" "$SERVER:$REMOTE_DIR/deploy/"

# Step 7: Restart services
echo "[7/7] Restarting services..."
$SSH $SERVER "systemctl enable einvoice-api einvoice-web && systemctl restart einvoice-api einvoice-web"

echo "=== Deploy complete ==="
echo "API: https://einvoice.doaide.com/api/usage"
echo "Web: https://einvoice.doaide.com"
echo ""
echo "NOTE: Remember to:"
echo "  1. Create backend/.env on server with GEMINI_API_KEY"
echo "  2. Append deploy/Caddyfile.snippet to the Caddy config and reload"
echo "  3. Add DNS A record for einvoice.doaide.com -> 89.167.8.178"
