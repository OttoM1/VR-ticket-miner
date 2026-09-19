#!/usr/bin/env bash

# local health checks
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
DIM='\033[0;36m'
NC='\033[0m'

STEP=0
FAIL=0

step() {
  STEP=$((STEP + 1))
  printf "${DIM}[%s]${NC} %s\n" "$STEP" "$1"
}

pass() {
  printf "${GREEN}  ok${NC} %s\n" "$1"
}

die() {
  printf "${RED}  fail${NC} %s\n" "$1"
  FAIL=1
}

run() {
  if "$@"; then
    pass "$*"
  else
    die "$*"
  fi
}

require_file() {
  if [[ -f "$1" ]]; then
    pass "found $1"
  else
    die "missing file: $1"
  fi
}

require_grep() {
  if grep -q "$2" "$1"; then
    pass "$3"
  else
    die "$3"
  fi
}

echo "VR Ticket Miner checks (root: $ROOT)"
echo

step "Node.js >= 20"
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" -ge 20 ]]; then
  pass "node $(node -v)"
else
  die "need Node 20+, got $(node -v)"
fi

step "Dependencies"
if [[ -d node_modules ]]; then
  pass "node_modules present"
else
  echo "  installing npm packages..."
  run npm install
fi

step "Static site assets"
require_file index.html
require_file body.css
require_file ui/body.jpg
require_grep body.css "ui/body.jpg" "body.css uses relative ui/body.jpg (GitHub Pages)"
if grep -q "url('/ui/body.jpg')" body.css 2>/dev/null; then
  die "body.css still uses root-absolute /ui/body.jpg"
fi

step "npm run lint"
run npm run lint

step "npm run typecheck"
run npm run typecheck

step "npm run build"
run npm run build

step "CLI --version"
run node dist/cli/index.js --version

step "CLI stations (non-empty)"
STATIONS_OUT="$(node dist/cli/index.js stations)"
if [[ -n "$STATIONS_OUT" ]] && grep -q Helsinki <<<"$STATIONS_OUT"; then
  pass "stations lists Helsinki"
else
  die "stations output unexpected"
fi

step "CLI search --mock (offline)"
run node dist/cli/index.js search \
  --from Helsinki \
  --to Tampere \
  --arrive 14:00 \
  --mock \
  --delay 0

step "CLI rejects bad --arrive"
if node dist/cli/index.js search --from HKI --to TKU --arrive bad --mock 2>/dev/null; then
  die "expected invalid --arrive to exit non-zero"
else
  pass "invalid --arrive exits with error"
fi

echo
if [[ "$FAIL" -eq 0 ]]; then
  printf "${GREEN}All checks passed.${NC}\n"
  exit 0
fi
printf "${RED}Some checks failed.${NC}\n"
exit 1
