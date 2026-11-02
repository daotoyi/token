#!/usr/bin/env bash
set -euo pipefail

readonly SERVER="${DYTOKEN_DEPLOY_SERVER:-root@49.232.35.145}"
readonly REMOTE_DIR="/www/wwwroot/token.dyinvest.cn"

npm run build

ssh "$SERVER" "mkdir -p '$REMOTE_DIR'"
rsync -az --delete "dist/" "$SERVER:$REMOTE_DIR/"
ssh "$SERVER" "chown -R www:www '$REMOTE_DIR' && find '$REMOTE_DIR' -type d -exec chmod 755 {} + && find '$REMOTE_DIR' -type f -exec chmod 644 {} +"

echo "Deployed to https://token.dyinvest.cn"
