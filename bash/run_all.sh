#!/usr/bin/env bash

# run env.sh first; on success, run the other bash/*.sh checks in order.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m';
GREEN='\033[0;32m';
YELLOW='\033[0;33m';
DIM='\033[0;36m';
NC='\033[0m';

LOCK_DIR="$ROOT/.cache/bash-run-all.lock"
mkdir -p "$ROOT/.cache"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Bash checks already running in another terminal."
  exit 0
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT

export VR_MINER_AUTO_CHECKS=1

echo -e "\n${DIM}=== VR Ticket Miner: environment (bash/env.sh) ===${NC}"
if ! bash "$ROOT/bash/env.sh"; then
  echo
  echo "Environment check failed; try fixing Node.js 20+ / git / bash, then re-run:"
  echo "  bash bash/run_all.sh"
  exit 1
fi

CHECKS=(
  bash/agent.sh
  bash/miner_script.sh
  bash/local_smoke.sh
)

for script in "${CHECKS[@]}"; do
  if [[ ! -f "$ROOT/$script" ]]; then
    echo "Missing $script"
    exit 1
  fi
  echo
  echo -e "${DIM}=== Running $script ===${NC}"
  if ! bash "$ROOT/$script"; then
    echo
    echo "Failed: $script"
    exit 1
  fi
done

echo
echo "Bash checks passed."
echo -e "Ready for development!"
exit 0
