#!/usr/bin/env bash

# quick check for env comp.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAIL=0


if ! command -v bash >/dev/null 2>&1; then
  echo "Install bash"
  FAIL=1
else
  echo "Bash OK: $(command -v bash)"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js: https://nodejs.org/"
  FAIL=1
else
  NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "$NODE_MAJOR" -lt 20 ]]; then
    echo "Node.js 20+ needed, currently $(node -v)"
    FAIL=1
  else
    echo "Node OK: $(node -v)"
  fi
fi


if ! command -v git >/dev/null 2>&1; then
  echo "Install git: https://git-scm.com/install/"
  FAIL=1
else
  echo "Git OK: $(git --version)"
fi

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
exit 0
