# VR Ticket Miner

<p align="center">
  <a href="https://ottom1.github.io/VR-ticket-miner/">
    <img src="ui/body.jpg" alt="VR Ticket Miner" width="100%">
  </a>
</p>

VR Ticket Miner is an open-source "vibe" project; bug reports, documentation improvements, and code changes are welcome.

## Overview

Find the cheapest VR train ticket for your route by scanning 14 days at once, instead of clicking through [vr.fi/junaliput](https://www.vr.fi/junaliput#osta-lippuja) one date at a time.

You pick origin, destination, passenger type (currently only adult or student), and when you need to **arrive**. The miner queries each of the next 14 days, keeps only trips that land inside an eight-hour arrival window and prints the cheapest option per day plus the best deal overall.

[![License: MIT](https://img.shields.io/badge/License-MIT-success?labelColor=2B2D42)](LICENCE)
[![Node 20+](https://img.shields.io/badge/node-20%2B-339933?labelColor=2B2D42)](https://nodejs.org/)
[![open source](https://img.shields.io/badge/open%20source-2B2D42?labelColor=2B2D42)](https://github.com/OttoM1/VR-ticket-miner)
[![CLI](https://img.shields.io/badge/interface-CLI-5D11A9?labelColor=2B2D42)](#tech-install--use)

- Current agent prompt pipeline is available at [`agent/`](agent/).
- Note: The documentation doesn't account for human made code changes.

## Disclaimer

This repository is **not for commercial use as-is**. VR Ticket Miner is an independent project and is **not made in collaboration with, endorsed by, or affiliated with VR Group or [vr.fi](https://www.vr.fi)**. If you use this tool with VR’s services, read VR’s [privacy policy](https://www.vr.fi/en/privacy) and [terms and conditions](https://www.vr.fi/en/terms-and-conditions) and follow them.

## Table of contents

- [Overview](#overview)
- [Install & Use](#tech-install--use)
- [Install & Use without IDE](#install--use-without-ide)
- [What the Search does](#what-the-search-does)
- [License](#license)

## Tech Install & Use

```bash
npm install
npm run build
npm link
npx playwright install chromium
npx serve
```

Then:

```bash
vr-miner search --from HKI --to TKU --arrive 09:30 --passenger student
```

### Prefer a generated command instead?

Open [`https://ottom1.github.io/VR-ticket-miner/`](https://ottom1.github.io/VR-ticket-miner/) in a browser.

## How to install & use without IDE

- Install Node.js 20+ [`https://nodejs.org/en/download`](https://nodejs.org/en/download)
- Open CLI (Terminal on MacOS, Command Prompt on Windows)
- Install git (if not already) [`https://git-scm.com/install/`](https://git-scm.com/install/)
- Verify:
- `git -v` (expected: 2.x.x)
- `node -v` (expected: v20+)

#### Then in CLI run these in order:

Note: (this needs to be done only once, not everytime you want to use the tool)

- `git clone https://github.com/OttoM1/VR-ticket-miner.git`
- `cd VR-ticket-miner`
- `npm install`
- `npm run build`
- `npm link`
- `npx playwright install chromium`
  Now the tool is installed and ready to use.
  You can now create a command in [`https://ottom1.github.io/VR-ticket-miner/`](https://ottom1.github.io/VR-ticket-miner/), and paste it to the CLI.

### Bash checks (clone / fork)

- (For devs only)

On folder open, the repo tries to open a **bash** and run [`bash/run_all.sh`](bash/run_all.sh) (`env.sh` first, then the other `bash/*.sh` scripts).

**One-time setup in VS Code / Cursor** (required?):

1. Open the **`VR-ticket-miner`** folder (or open [`VR-ticket-miner.code-workspace`](VR-ticket-miner.code-workspace)).
2. **Trust** the workspace if prompted.
3. Command Palette: **`Tasks: Manage Automatic Tasks in Folder`** -> **Allow Automatic Tasks**.
4. Reload the window. You should see a terminal tab running the checks.

Optional: **Terminals Manager** can run the same command manually via [`.vscode/terminals.json`](.vscode/terminals.json) (`Terminals: Run`) — `autorun` is off so it does not race the folder-open task.

Manual run:

```bash
bash bash/env.sh          # env only
npm run check-bash        # env + all bash checks
```

#### Having issues with installation?

Hit me up:

- [Contact](mailto:otto.mularii@gmail.com)

## What the search does

VR’s site makes you search one day at a time. This tool automates that loop.

For each of 14 consecutive days (starting tomorrow, or from `--start`):

1. Request trips for your route and passenger type.
2. Drop anything that arrives outside the window `(target − band, target]`. By default the band is eight hours ending at your `--arrive` time — e.g. `--arrive 14:00` keeps arrivals between 06:01 and 14:00.
3. Take the cheapest remaining trip that day.
4. After all 14 days, highlight the single best price across the week.

## License

MIT

-- OttoM1 & Cursor --
