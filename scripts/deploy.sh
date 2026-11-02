#!/usr/bin/env bash
set -euo pipefail

readonly SERVER="${DYTOKEN_DEPLOY_SERVER:-root@49.232.35.145}"
readonly REMOTE_DIR="/www/wwwroot/token.dyinvest.cn"
readonly API_DIR="/opt/dytoken-api"
readonly NGINX_EXTENSION_DIR="/www/server/panel/vhost/nginx/extension/token.dyinvest.cn"

npm run build

ssh "$SERVER" "mkdir -p '$REMOTE_DIR'"
rsync -az --delete --exclude=".user.ini" "dist/" "$SERVER:$REMOTE_DIR/"
ssh "$SERVER" "find '$REMOTE_DIR' -path '$REMOTE_DIR/.user.ini' -prune -o -exec chown www:www {} + && find '$REMOTE_DIR' -path '$REMOTE_DIR/.user.ini' -prune -o -type d -exec chmod 755 {} + && find '$REMOTE_DIR' -path '$REMOTE_DIR/.user.ini' -prune -o -type f -exec chmod 644 {} +"

ssh "$SERVER" "mkdir -p '$API_DIR/server' '$API_DIR/data' '$NGINX_EXTENSION_DIR'"
rsync -az --delete --exclude="node_modules" --exclude="data" "server/" "$SERVER:$API_DIR/server/"
rsync -az package.json package-lock.json ecosystem.config.cjs "$SERVER:$API_DIR/"
scp -q deploy/dytoken-api.nginx.conf "$SERVER:$NGINX_EXTENSION_DIR/dytoken-api.conf"
ssh "$SERVER" "
  set -e
  if [ ! -f '$API_DIR/.env' ]; then
    secret=\$(openssl rand -hex 32)
    {
      printf '%s\n' 'NODE_ENV=production'
      printf '%s\n' 'PUBLIC_ORIGIN=https://token.dyinvest.cn'
      printf '%s\n' 'API_ORIGIN=https://token.dyinvest.cn'
      printf '%s\n' 'API_PORT=4100'
      printf '%s\n' 'DATABASE_PATH=/opt/dytoken-api/data/auth.db'
      printf '%s\n' \"AUTH_SECRET=\$secret\"
      printf '%s\n' 'SESSION_DAYS=30'
      printf '%s\n' 'EMAIL_CODE_TTL_MINUTES=10'
      printf '%s\n' 'EMAIL_DEV_MODE=false'
      printf '%s\n' 'RESEND_API_KEY='
      printf '%s\n' 'MAIL_FROM=DyToken <no-reply@dyinvest.cn>'
      printf '%s\n' 'SENDMAIL_PATH=/usr/sbin/sendmail'
      printf '%s\n' 'ENABLE_SENDMAIL=false'
      printf '%s\n' 'SMTP_HOST='
      printf '%s\n' 'SMTP_PORT=587'
      printf '%s\n' 'SMTP_SECURE=false'
      printf '%s\n' 'SMTP_USER='
      printf '%s\n' 'SMTP_PASS='
      printf '%s\n' 'GOOGLE_CLIENT_ID='
      printf '%s\n' 'GOOGLE_CLIENT_SECRET='
      printf '%s\n' 'GITHUB_CLIENT_ID='
      printf '%s\n' 'GITHUB_CLIENT_SECRET='
      printf '%s\n' 'APPLE_CLIENT_ID='
      printf '%s\n' 'APPLE_TEAM_ID='
      printf '%s\n' 'APPLE_KEY_ID='
      printf '%s\n' 'APPLE_PRIVATE_KEY='
      printf '%s\n' 'X_CLIENT_ID='
      printf '%s\n' 'X_CLIENT_SECRET='
    } > '$API_DIR/.env'
  fi
  grep -q '^RESEND_API_KEY=' '$API_DIR/.env' || printf '%s\n' 'RESEND_API_KEY=' >> '$API_DIR/.env'
  grep -q '^ENABLE_SENDMAIL=' '$API_DIR/.env' || printf '%s\n' 'ENABLE_SENDMAIL=false' >> '$API_DIR/.env'
  chown -R www:www '$API_DIR'
  chmod 600 '$API_DIR/.env'
  cd '$API_DIR'
  lock_hash=\$(sha256sum package-lock.json | awk '{print \$1}')
  installed_hash=\$(cat .package-lock.sha256 2>/dev/null || true)
  if [ ! -d node_modules ] || [ \"\$lock_hash\" != \"\$installed_hash\" ]; then
    npm ci --omit=dev
    printf '%s\n' \"\$lock_hash\" > .package-lock.sha256
    chown www:www .package-lock.sha256
  fi
  pm2 startOrReload ecosystem.config.cjs --update-env
  pm2 save
  nginx -t
  nginx -s reload
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl -fsS http://127.0.0.1:4100/api/health >/dev/null; then
      break
    fi
    sleep 1
  done
  curl -fsS http://127.0.0.1:4100/api/health
"

echo
echo "Deployed to https://token.dyinvest.cn"
