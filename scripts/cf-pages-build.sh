#!/usr/bin/env bash
#
# Cloudflare Pages build for BRIDGE Flow — builds ONLY the web app.
#
# Point the Pages project's "Build command" at this script:
#     bash scripts/cf-pages-build.sh
# and set "Build output directory" to:
#     packages/frontend/apps/web/dist
# (the wrangler.toml `pages_build_output_dir` already declares this too).
#
# Cloudflare runs `yarn install` BEFORE this script. Set these env vars in the
# Pages project so the install stays light and doesn't fail:
#     YARN_ENABLE_SCRIPTS = false   # skip postinstall (`bridgeflow init` compiles Rust) + husky
#     HUSKY               = 0        # belt-and-suspenders: never install git hooks in CI
# The web bundle does NOT need the Rust native modules, so skipping them is safe.
#
set -euo pipefail

export HUSKY=0
# REQUIRED: without PUBLIC_PATH=/ the bundler bakes https://dev.bridgeflowassets.com/
# into index.html and every asset 404s (blank page). "/" serves assets from the
# Pages origin. Chunks live under /js/, so "/" is correct.
export PUBLIC_PATH=/

echo "==> [1/3] Building @bridgeflow/templates (assets consumed by the web bundle)"
corepack yarn workspace @bridgeflow/templates build

echo "==> [2/3] Building the web app (@bridgeflow/web)"
# Call the runner directly instead of `yarn bridgeflow web build` — the CLI shim
# (tools/cli/bin/cli.js) spawns a global `yarn` that isn't always resolvable in
# CI; runner.js is exactly what that shim invokes, minus the fragile spawn.
node tools/cli/bin/runner.js bridgeflow.ts web build

DIST="packages/frontend/apps/web/dist"
echo "==> [3/3] Trimming $DIST for Cloudflare Pages"
# Sourcemaps: not needed in production (they roughly double the upload).
find "$DIST" -name '*.map' -type f -delete
# The Typst compiler wasm is ~28 MB and exceeds Cloudflare's 25 MiB/file limit,
# which would reject the whole deploy. Dropping it only disables Typst export.
find "$DIST" -name 'typst_ts_web_compiler_bg*.wasm' -type f -delete

echo "==> Done. Output ready in $DIST"
