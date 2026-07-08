#!/usr/bin/env bash
# Deploy Aethelred RWA to rwa.buildingcultureid.space
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_HOST="${DEPLOY_SSH_HOST:-root@187.124.18.204}"
SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
REMOTE_DIR="/var/www/rwa-buildingculture"
PORT="${DEPLOY_PORT:-3016}"
DOMAIN="rwa.buildingcultureid.space"

echo "==> Building production bundle"
cd "$ROOT"
set -a
# shellcheck disable=SC1091
source .env
set +a
export SIWS_DOMAIN="$DOMAIN"
export VITE_SITE_URL="https://$DOMAIN"
npm run build

# Nitro bundles some Solana deps into a CJS-in-ESM chunk; prepend a tiny shim.
ANCHOR_LIB="$ROOT/.output/server/_libs/@coral-xyz/anchor.mjs"
if [[ -f "$ANCHOR_LIB" ]] && ! head -1 "$ANCHOR_LIB" | grep -q 'var exports'; then
  tmp="$(mktemp)"
  printf 'var exports = {};\nvar module = { exports };\n' > "$tmp"
  cat "$ANCHOR_LIB" >> "$tmp"
  mv "$tmp" "$ANCHOR_LIB"
fi

echo "==> Syncing to $SSH_HOST:$REMOTE_DIR"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SSH_HOST" "mkdir -p $REMOTE_DIR/{dist,data,uploads,prisma} /var/log/rwa-buildingculture"
rsync -az --delete -e "ssh -i $SSH_KEY -o BatchMode=yes" \
  "$ROOT/.output/" "$SSH_HOST:$REMOTE_DIR/dist/"
rsync -az -e "ssh -i $SSH_KEY -o BatchMode=yes" \
  "$ROOT/prisma/schema.prisma" "$SSH_HOST:$REMOTE_DIR/prisma/"

if [[ -f "$ROOT/prisma/dev.db" ]]; then
  rsync -az -e "ssh -i $SSH_KEY -o BatchMode=yes" \
    "$ROOT/prisma/dev.db" "$SSH_HOST:$REMOTE_DIR/data/prod.db"
fi

echo "==> Writing production .env"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SSH_HOST" "cat > $REMOTE_DIR/.env" <<EOF
NODE_ENV=production
DATABASE_URL="file:/var/www/rwa-buildingculture/data/prod.db"
SIWS_DOMAIN="$DOMAIN"
VITE_SITE_URL="https://$DOMAIN"
UPLOAD_DIR="./uploads"

SOLANA_RPC_URL="${SOLANA_RPC_URL}"
VITE_SOLANA_RPC_URL="${VITE_SOLANA_RPC_URL}"
VITE_SOLANA_NETWORK="${VITE_SOLANA_NETWORK}"
VITE_DRIFT_ENV="${VITE_DRIFT_ENV:-devnet}"

VITE_USDC_MINT_ADDRESS="${VITE_USDC_MINT_ADDRESS}"
USDC_MINT_ADDRESS="${USDC_MINT_ADDRESS}"
VITE_PASSPORT_PROGRAM_ID="${VITE_PASSPORT_PROGRAM_ID}"
VITE_REGISTRY_PROGRAM_ID="${VITE_REGISTRY_PROGRAM_ID}"
VITE_NAMES_PROGRAM_ID="${VITE_NAMES_PROGRAM_ID}"
VITE_VAULT_PROGRAM_ID="${VITE_VAULT_PROGRAM_ID}"
PASSPORT_PROGRAM_ID="${PASSPORT_PROGRAM_ID}"
REGISTRY_PROGRAM_ID="${REGISTRY_PROGRAM_ID}"
NAMES_PROGRAM_ID="${NAMES_PROGRAM_ID}"
VAULT_PROGRAM_ID="${VAULT_PROGRAM_ID}"
VITE_EURO_MINT_ADDRESS="${VITE_EURO_MINT_ADDRESS}"
VITE_REWARDS_MINT_ADDRESS="${VITE_REWARDS_MINT_ADDRESS}"
EURO_MINT_ADDRESS="${EURO_MINT_ADDRESS}"
REWARDS_MINT_ADDRESS="${REWARDS_MINT_ADDRESS}"

SOLANA_DEPLOYER_SECRET="${SOLANA_DEPLOYER_SECRET}"
TREASURY_WALLET_ADDRESS="${TREASURY_WALLET_ADDRESS:-}"
DEPLOY_ADMIN_SECRET="${DEPLOY_ADMIN_SECRET}"
ADMIN_SECRET="${ADMIN_SECRET:-}"
ADMIN_WALLETS="${ADMIN_WALLETS:-}"
GUARDIAN_SIGNER_SECRET="${GUARDIAN_SIGNER_SECRET:-}"
GUARDIAN_SIGNER_PUBKEY="${GUARDIAN_SIGNER_PUBKEY:-}"
VERIFF_WEBHOOK_SECRET="${VERIFF_WEBHOOK_SECRET:-}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
HELIUS_API_KEY="${HELIUS_API_KEY:-}"
EOF

echo "==> Installing Prisma runtime on server"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SSH_HOST" bash -s <<'REMOTE'
set -euo pipefail
cd /var/www/rwa-buildingculture
cat > package.json <<'PKG'
{
  "name": "aethelred-rwa-runtime",
  "private": true,
  "type": "module",
  "dependencies": {
    "@coral-xyz/anchor": "0.30.1",
    "@prisma/client": "5.22.0",
    "@solana/spl-token": "0.4.14",
    "@solana/web3.js": "1.98.4",
    "bn.js": "5.2.4",
    "bs58": "6.0.0",
    "buffer": "6.0.3",
    "prisma": "5.22.0",
    "tweetnacl": "1.0.3"
  }
}
PKG
npm install --omit=dev --no-audit --no-fund
npx prisma generate --schema=prisma/schema.prisma
if [[ ! -f data/prod.db ]]; then
  DATABASE_URL="file:/var/www/rwa-buildingculture/data/prod.db" npx prisma db push --schema=prisma/schema.prisma
fi
chmod 664 data/prod.db 2>/dev/null || true
chmod 775 data
chmod 600 .env
REMOTE

echo "==> Installing systemd + nginx"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SSH_HOST" "PORT=$PORT bash -s" <<'REMOTE'
set -euo pipefail
cat > /etc/systemd/system/rwa-buildingculture.service <<UNIT
[Unit]
Description=Aethelred RWA — rwa.buildingcultureid.space
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/rwa-buildingculture
EnvironmentFile=/var/www/rwa-buildingculture/.env
Environment=PORT=$PORT
Environment=HOST=127.0.0.1
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server/index.mjs
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/rwa-buildingculture/app.log
StandardError=append:/var/log/rwa-buildingculture/app.log

[Install]
WantedBy=multi-user.target
UNIT

if [[ ! -f /etc/nginx/sites-available/rwa.buildingcultureid.space.conf ]]; then
  cat > /etc/nginx/sites-available/rwa.buildingcultureid.space.conf <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name rwa.buildingcultureid.space;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:__PORT__;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
  sed -i "s/__PORT__/${PORT}/g" /etc/nginx/sites-available/rwa.buildingcultureid.space.conf
  ln -sf /etc/nginx/sites-available/rwa.buildingcultureid.space.conf /etc/nginx/sites-enabled/
fi

nginx -t && systemctl reload nginx

if [[ ! -f /etc/letsencrypt/live/rwa.buildingcultureid.space/fullchain.pem ]]; then
  certbot certonly --webroot -w /var/www/certbot -d rwa.buildingcultureid.space \
    --non-interactive --agree-tos -m admin@buildingcultureid.space
  cat > /etc/nginx/sites-available/rwa.buildingcultureid.space.conf <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name rwa.buildingcultureid.space;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rwa.buildingcultureid.space;

    ssl_certificate /etc/letsencrypt/live/rwa.buildingcultureid.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rwa.buildingcultureid.space/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:__PORT__;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        add_header Cache-Control "no-store, must-revalidate" always;
    }
}
NGINX
  sed -i "s/__PORT__/${PORT}/g" /etc/nginx/sites-available/rwa.buildingcultureid.space.conf
fi

systemctl daemon-reload
systemctl enable rwa-buildingculture
systemctl restart rwa-buildingculture
nginx -t
systemctl reload nginx
REMOTE

echo "==> Health check"
sleep 2
ssh -i "$SSH_KEY" -o BatchMode=yes "$SSH_HOST" "curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:$PORT/"
echo "Deployed to https://$DOMAIN"
