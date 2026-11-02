#!/usr/bin/env bash
set -euo pipefail

readonly SERVER="${DYTOKEN_DEPLOY_SERVER:-root@49.232.35.145}"
readonly REMOTE_DIR="/www/wwwroot/token.dyinvest.cn"

npm run build

ssh "$SERVER" "mkdir -p '$REMOTE_DIR'"
rsync -az --delete --exclude=".user.ini" "dist/" "$SERVER:$REMOTE_DIR/"
ssh "$SERVER" "find '$REMOTE_DIR' -path '$REMOTE_DIR/.user.ini' -prune -o -exec chown www:www {} + && find '$REMOTE_DIR' -path '$REMOTE_DIR/.user.ini' -prune -o -type d -exec chmod 755 {} + && find '$REMOTE_DIR' -path '$REMOTE_DIR/.user.ini' -prune -o -type f -exec chmod 644 {} +"

echo "Deployed to https://token.dyinvest.cn"
