# VR Ticket Miner

VR Ticket Miner is an open-source "vibe" project; bug reports, documentation improvements, and code changes are welcome.

- Current agent prompt pipeline is available at [`agent/`](agent/).
- Note: The documentation doesn't account for human made code changes.

## Overview

Find the cheapest VR train ticket for your route by scanning seven days at once, instead of clicking through [vr.fi/junaliput](https://www.vr.fi/junaliput#osta-lippuja) one date at a time.

You pick origin, destination, passenger type (currently only adult or student), and when you need to **arrive**. The miner queries each of the next seven days, keeps only trips that land inside an eight-hour arrival window and prints the cheapest option per day plus the best deal overall.

# Live VR searches (optional)

npx playwright install chromium

## Tech Install & Use

```bash
npm install
npm run build
npm link          # optional: vr-miner globally
npx playwright install chromium   # only for live mode
cd web && npx serve # starts the UI for prompt builder
```

Then:

```bash
vr-miner search --from HKI --to TKU --arrive 09:30 --passenger student
```

### Prefer a generated command instead?

Open [`https://ottom1.github.io/VR-ticket-miner/`](https://ottom1.github.io/VR-ticket-miner/) in a browser.

// During development, prefix with `npm run dev --` instead of calling `vr-miner` directly.

## How to install & use without IDE

- 1. Install Node.js 20+ [`https://nodejs.org/en/download`](https://nodejs.org/en/download)
- 2. Open CLI (Terminal on MacOS, Command Prompt on Windows)
- 3. Install git (if not already) [`https://git-scm.com/install/`](https://git-scm.com/install/)

#### 4. then in CLI run these in order:

Note: (this needs to be done only once, not everytime you want to use the tool)

- `git clone https://github.com/OttoM1/VR-ticket-miner.git``
- `cd VR-ticket-miner`
- `npm install`
- `npm run build`
- `npm link`
- `npx playwright install chromium`
  Now the tool is installed and ready to use.
  You can now create a command in [`https://ottom1.github.io/VR-ticket-miner/`](https://ottom1.github.io/VR-ticket-miner/), and paste it to the CLI.

#### Having issues with installation?

Hit me up:

- [Contact](mailto:otto.mularii@gmail.com)

## What the search does

VR’s site makes you search one day at a time. This tool automates that loop.

For each of seven consecutive days (starting tomorrow, or from `--start`):

1. Request trips for your route and passenger type.
2. Drop anything that arrives outside the window `(target − band, target]`. By default the band is eight hours ending at your `--arrive` time — e.g. `--arrive 14:00` keeps arrivals between 06:01 and 14:00.
3. Take the cheapest remaining trip that day.
4. After all seven days, highlight the single best price across the week.

## License

MIT

-- OttoM1 & Cursor --
