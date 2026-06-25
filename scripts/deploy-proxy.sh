#!/usr/bin/env bash
#
# Deploy the Groq transcription proxy to a remote VPS.
#
# Usage:
#   ./scripts/deploy-proxy.sh               # defaults: chrisfung@5.223.78.129
#   VPS_USER=root VPS_HOST=myhost ./scripts/deploy-proxy.sh
#
# Prerequisites:
#   - SSH key auth to the VPS
#   - Node 18+ on the VPS
#   - GROQ_API_KEY in local .env (will be copied to VPS)
#
set -euo pipefail

VPS_USER="${VPS_USER:-chrisfung}"
VPS_HOST="${VPS_HOST:-5.223.78.129}"
VPS_PORT="${VPS_PORT:-3099}"
REMOTE_DIR="/home/${VPS_USER}/groq-proxy"

echo "==> Deploying Groq proxy to ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}"

# Create remote directory
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${REMOTE_DIR}"

# Copy proxy server
scp scripts/remote-proxy.mjs "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/remote-proxy.mjs"

# Copy .env (contains GROQ_API_KEY)
scp .env "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/.env"

# Create systemd user service for auto-restart
ssh "${VPS_USER}@${VPS_HOST}" bash -s <<REMOTE
set -e

# Ensure systemd user dir exists
mkdir -p ~/.config/systemd/user

# Write service file
cat > ~/.config/systemd/user/groq-proxy.service <<'SVC'
[Unit]
Description=Groq Whisper Transcription Proxy
After=network.target

[Service]
Type=simple
WorkingDirectory=${REMOTE_DIR}
ExecStart=/usr/bin/env node ${REMOTE_DIR}/remote-proxy.mjs
Restart=on-failure
RestartSec=5
Environment=PORT=${VPS_PORT}

[Install]
WantedBy=default.target
SVC

# Reload + start
systemctl --user daemon-reload
systemctl --user restart groq-proxy.service
systemctl --user enable groq-proxy.service

echo "Service status:"
systemctl --user status groq-proxy.service --no-pager || true
REMOTE

echo ""
echo "==> Deployed! Proxy running at http://${VPS_HOST}:${VPS_PORT}/api/transcribe"
echo ""
echo "Verify:  curl http://${VPS_HOST}:${VPS_PORT}/health"
echo ""
echo "Add to local .env:"
echo "  VITE_STT_ENDPOINT=http://${VPS_HOST}:${VPS_PORT}/api/transcribe"
