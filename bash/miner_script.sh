#!/usr/bin/env bash

# miner core behaviour check (offline mock)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
DIM='\033[0;36m'
NC='\033[0m'

CLI=(node dist/cli/index.js)
STEP=0
FAIL=0

step() {
  STEP=$((STEP + 1))
  printf "${DIM} [%s]${NC} %s\n" "$STEP" "$1"
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

cheapest_eur() {
  local passenger="$1"
  "${CLI[@]}" search \
    --from HKI \
    --to TKU \
    --arrive 14:00 \
    --passenger "$passenger" \
    --mock \
    --delay 0 2>&1 \
    | grep -F '★ Cheapest option:' \
    | grep -oE '[0-9]+\.[0-9]{2}' \
    | head -1
}

echo "Miner script checks (root: $ROOT)"
echo

step "CLI build present"
if [[ -f dist/cli/index.js ]]; then
  pass "dist/cli/index.js"
else
  echo "  building..."
  run npm run build
fi

step "Mock search scans 14 days"
SEARCH_OUT="$("${CLI[@]}" search \
  --from HKI \
  --to TKU \
  --arrive 14:00 \
  --mock \
  --delay 0 2>&1)" || true
if grep -q 'Scanned 14 days' <<<"$SEARCH_OUT"; then
  pass "14-day window completed"
else
  die "expected Scanned 14 days in mock search output"
fi

step "Mock search reports route and overall cheapest"
if grep -q 'Helsinki (HKI) → Turku (TKU)' <<<"$SEARCH_OUT" \
  && grep -qF '★ Cheapest option:' <<<"$SEARCH_OUT"; then
  pass "route header and cheapest highlight"
else
  die "mock search missing route or ★ Cheapest option"
fi

step "Student fare under adult (mock pricing)"
ADULT_EUR="$(cheapest_eur adult)"
STUDENT_EUR="$(cheapest_eur student)"
if [[ -n "$ADULT_EUR" && -n "$STUDENT_EUR" ]] \
  && awk -v s="$STUDENT_EUR" -v a="$ADULT_EUR" 'BEGIN { exit !(s < a) }'; then
  pass "student $STUDENT_EUR EUR < adult $ADULT_EUR EUR"
else
  die "student fare should be lower than adult (got student=$STUDENT_EUR adult=$ADULT_EUR)"
fi

step "Reject invalid --arrive"
if INVALID_ARRIVE_OUT="$("${CLI[@]}" search --from HKI --to TKU --arrive bad --mock 2>&1)"; then
  die "invalid --arrive should exit non-zero (got: $INVALID_ARRIVE_OUT)"
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
