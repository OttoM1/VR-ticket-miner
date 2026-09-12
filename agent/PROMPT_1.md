## Prompt 1: Project Scaffold

- agent: Cursor Composer 2.5.0

### You are an Senior TypeScript & bash engineer. You are going to build a "VR Ticket Miner" (CLI tool to scrape and find the cheapest train tickets for a specified route across an entire week from vr.fi).

[`https://www.vr.fi`]: (https://www.vr.fi)

#### Stack:

- Node.js (v20+) with TypeScript (ESM)
- Node-fetch / Axios (fall back to Playwright headless browser?)

#### Requirements & Architecture (e.g.):

1. Clean modularity:
   - Logic for querying VR's API or scraping.
   - Emulate the search request to endpoints.
   - Station resolver (mapping station short codes).
   - Miner: The aggregator that accepts origin, destination and a target start date. Throttles calls for all 7 days of that week + parses.
   - Suitable CLI (free of choice).

2. Robustness:
   - Add rate-limiting to avoid getting IP-ban.
   - Print a clear visual summary.

#### Initial Setup Tasks:

1. Initialize json and set up scripts.
2. Scaffold the core structure.
3. Stub the VR network client.
