#!/usr/bin/env bash

# quick check for env comp.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m';
DIM='\033[0;36m';
RED='\033[0;31m';
NC='\033[0m';

FAIL=0


if ! command -v bash >/dev/null 2>&1; then
  echo -e "\n${RED}Install bash - on Windows install git bash${NC} https://git-scm.com/downloads \n"
  FAIL=1
else
  echo -e "\n${GREEN}Bash OK:${NC} $(command -v bash)\n"
fi

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Install Node.js:${NC} https://nodejs.org/\n"
  FAIL=1
else
  NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "$NODE_MAJOR" -lt 20 ]]; then
    echo -e "${RED}Node.js 20+ needed, currently${NC} $(node -v)\n"
    FAIL=1
  else
    echo -e "${GREEN}Node OK:${NC} $(node -v)\n"
  fi
fi


if ! command -v git >/dev/null 2>&1; then
  echo -e "${RED}Install git:${NC} https://git-scm.com/install/ \n"
  FAIL=1
else
  echo -e "${GREEN}Git OK:${NC} $(git --version)\n"
fi

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
exit 0
