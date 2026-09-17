#!/usr/bin/env bash
SHA=af68af75
CHUNK=index.72160d8c.js

for i in $(seq 1 40); do
  LINE=$(gh api "repos/4waiz/bridge-workspace/commits/$SHA/check-runs" \
    --jq '.check_runs[] | .status + "|" + (.conclusion // "pending")' 2>/dev/null | head -1)
  echo "[$(date +%H:%M:%S)] try $i  $LINE"
  case "$LINE" in
    completed*) echo "*** BUILD ${LINE##*|} ***"; break ;;
  esac
  sleep 30
done

echo
for i in $(seq 1 12); do
  CT=$(curl -s -o /dev/null -w '%{content_type}' "https://flow.bridgeae.com/js/$CHUNK")
  SZ=$(curl -s -o /dev/null -w '%{size_download}' "https://flow.bridgeae.com/js/$CHUNK")
  echo "[$(date +%H:%M:%S)] $CHUNK -> $SZ bytes ($CT)"
  case "$CT" in
    text/javascript*) echo "*** LIVE ***"; break ;;
  esac
  sleep 30
done
