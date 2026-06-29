# Build the BRIDGE Flow web frontend and deploy it to Cloudflare Pages.
#
# Usage (from the repo root, in PowerShell):
#   .\deploy-web.ps1
#
# If PowerShell blocks the script, run it once like this instead:
#   powershell -ExecutionPolicy Bypass -File .\deploy-web.ps1

$ErrorActionPreference = 'Stop'

$Repo    = $PSScriptRoot
$Dist    = Join-Path $Repo 'packages\frontend\apps\web\dist'
$Project = 'bridge-flow'

Write-Host '==> Building web app (rspack)...' -ForegroundColor Cyan
# Serve assets from this same domain, not the (nonexistent) CDN asset host.
$env:PUBLIC_PATH = '/'
node "$Repo\tools\cli\bin\runner.js" bridgeflow.ts bundle -p '@bridgeflow/web'
if ($LASTEXITCODE -ne 0) { throw "Build failed (exit $LASTEXITCODE)" }

Write-Host '==> Stripping source maps (not needed in production)...' -ForegroundColor Cyan
Get-ChildItem -Path $Dist -Recurse -File -Filter '*.map' | Remove-Item -Force

Write-Host "==> Removing files over Cloudflare's 25 MiB limit (e.g. the Typst wasm)..." -ForegroundColor Cyan
Get-ChildItem -Path $Dist -Recurse -File | Where-Object { $_.Length -gt 25MB } | Remove-Item -Force

Write-Host "==> Deploying to Cloudflare Pages ($Project)..." -ForegroundColor Cyan
npx --yes wrangler@latest pages deploy $Dist --project-name $Project --branch main --commit-dirty=true
if ($LASTEXITCODE -ne 0) { throw "Deploy failed (exit $LASTEXITCODE)" }

Write-Host "==> Done. Live at https://$Project.pages.dev  (hard-refresh: Ctrl+Shift+R)" -ForegroundColor Green
