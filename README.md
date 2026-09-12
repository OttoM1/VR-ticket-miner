# VR Ticket Miner

VR Ticket Miner is an open-source "vibe" project; bug reports, documentation improvements, and code changes are welcome.

- Current agent prompt pipeline is available at [`agent/`](agent/).
- Note: The documentation doesn't account for human made code changes.

## Overview

Find the cheapest VR train ticket for your route by scanning seven days at once, instead of clicking through [vr.fi/junaliput](https://www.vr.fi/junaliput#osta-lippuja) one date at a time.

You pick origin, destination, passenger type (currently only adult or student), and when you need to **arrive**. The miner queries each of the next seven days, keeps only trips that land inside a four-hour arrival window and prints the cheapest option per day plus the best deal overall.

## Install & Use

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

## What the search does

VR’s site makes you search one day at a time. This tool automates that loop.

For each of seven consecutive days (starting tomorrow, or from `--start`):

1. Request trips for your route and passenger type.
2. Drop anything that arrives outside the window `(target − band, target]`. By default the band is four hours ending at your `--arrive` time — e.g. `--arrive 14:00` keeps arrivals between 10:01 and 14:00.
3. Take the cheapest remaining trip that day.
4. After all seven days, highlight the single best price across the week.

## License

MIT

-- OttoM1 & Cursor --
