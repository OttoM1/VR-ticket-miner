#!/usr/bin/env bash

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)";

RED='\033[0;31m';
GREEN='\033[0;32m';
YELLOW='\033[0;33m';
DIM='\033[0;36m';
NC='\033[0m';

FAIL=0;
cd "$ROOT/agent";
echo -e "${DIM}\n\nQuick bash check (agent pipeline):\n${NC}";
if [[ -f PROMPT_1.md && -f PROMPT_2.md && -f PROMPT_3.md && -f PROMPT_4.md ]];
then
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 1 ---------\n${NC}"; head -n 3 'PROMPT_1.md';
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 2 ---------\n${NC}"; head -n 3 'PROMPT_2.md';
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 3 ---------\n${NC}"; head -n 3 'PROMPT_3.md';
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 4 ---------\n${NC}"; head -n 3 'PROMPT_4.md';

if [[ -t 0 && -z "${VR_MINER_AUTO_CHECKS:-}" ]]; then
printf "\n\n${DIM}Want the full file content?\n${NC}";
read -n 1 -p "y/n: " full_content;
else
full_content=n;
echo -e "${DIM}\n\nSkipped full file prompt (auto / non-interactive).\n${NC}";
fi
if [[ $full_content == "y" ]];
then
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 1 ---------\n${NC}"; cat 'PROMPT_1.md';
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 2 ---------\n${NC}"; cat 'PROMPT_2.md';
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 3 ---------\n${NC}"; cat 'PROMPT_3.md';
printf "${GREEN}\n\n--------- agent pipeline - PROMPT 4 ---------\n${NC}"; cat 'PROMPT_4.md';
printf "${NC}\n\n${NC}";

else echo -e "${DIM}\n\nSkipped full file content.\n${NC}";
fi;

else printf "${RED}\n\n---------Agent pipeline not found---------\n${NC}";
FAIL=1;
fi

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi
exit 0