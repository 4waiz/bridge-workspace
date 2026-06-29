#!/usr/bin/env bash
# Build the BRIDGE Flow web frontend and deploy it to Cloudflare Pages.
#
# Usage (from the repo root, in Git Bash):
#   ./deploy-web.sh
#
# This works around the fact that `yarn` is not installed globally on this
# machine — it calls the repo's bundled yarn / CLI runner directly.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="$REPO/packages/frontend/apps/web/dist"
PROJECT="bridge-flow"

echo "==> Building web app (rspack)..."
node "$REPO/tools/cli/bin/runner.js" bridgeflow.ts bundle -p @bridgeflow/web

echo "==> Stripping source maps (not needed in production)..."
find "$DIST" -name "*.map" -delete

echo "==> Removing files over Cloudflare's 25 MiB limit (e.g. the Typst wasm)..."
find "$DIST" -type f -size +25M -delete

echo "==> Deploying to Cloudflare Pages ($PROJECT)..."
npx --yes wrangler@latest pages deploy "$DIST" \
  --project-name "$PROJECT" --branch main --commit-dirty=true

echo "==> Done. Live at https://$PROJECT.pages.dev (hard-refresh: Ctrl+Shift+R)"
