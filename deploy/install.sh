#!/bin/bash
# Run on Hetzner as root: bash install.sh
set -euo pipefail

REPO="https://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@github.com/Agyeman-Enterprises/vantage.git"
DEST="/opt/vantage"

echo "=== Installing Vantage on Hetzner ==="

# Install Node if missing
if ! command -v node &>/dev/null; then
  curl -fsSL -o /tmp/nodesource_setup.sh https://deb.nodesource.com/setup_22.x
  # Verify it's a shell script before executing
  if ! head -1 /tmp/nodesource_setup.sh | grep -q '^#!'; then
    echo "ERROR: Unexpected content from nodesource. Aborting." && exit 1
  fi
  bash /tmp/nodesource_setup.sh
  rm -f /tmp/nodesource_setup.sh
  apt-get install -y nodejs
fi

# Clone or pull
if [ -d "$DEST/.git" ]; then
  echo "Updating existing install..."
  cd "$DEST" && git pull
else
  echo "Cloning repo..."
  git clone "$REPO" "$DEST"
  cd "$DEST"
fi

# Install deps and build
npm ci --omit=dev
npm run build

# Create .env if not present
if [ ! -f "$DEST/.env" ]; then
  cat > "$DEST/.env" << 'EOF'
PROBE_IMAP_PASS=Vantage2026!probe#
EOF
  chmod 600 "$DEST/.env"
fi

# Create .keys dir
mkdir -p "$DEST/.keys"

# Install and start systemd service
cp "$DEST/deploy/vantage.service" /etc/systemd/system/vantage.service
systemctl daemon-reload
systemctl enable vantage
systemctl restart vantage

echo ""
echo "=== Done ==="
systemctl status vantage --no-pager
echo ""
echo "Dashboard: https://vantage.agyemanenterprises.com"
echo ""
echo "ACTION REQUIRED — add this Cloudflare tunnel route:"
echo "  Hostname: vantage.agyemanenterprises.com"
echo "  Service:  http://localhost:4021"
