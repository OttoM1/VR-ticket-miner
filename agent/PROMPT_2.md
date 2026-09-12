## Prompt 2: Search Logic Refinement

- agent: Cursor Composer 2.5.0

Excellent! Now let's implement more detailed and robust search logic for VR train tickets (vr.fi/junaliput) across a 7-day window with arrival-time filtering.

Build a CLI search command that queries and compares train tickets across a 7-day rolling window.

#### Core CLI Parameters & Logic

- Support city names / station codes (e.g. Helsinki / HKI, Tampere / TKU).
- Accept adult or student. Map these to VR passenger types (ADULT / STUDENT).
- Define the arrival window filter. Keep trips arriving within band hours.
- For each day, query the trips, filter by arrival band, find the cheapest option, and display a summary.

#### Scraper & Integration Details

- Target URL: Frontend purchase flow: `/fi/singleTicketPurhcaseFlow_outboundSearchResultsPage?from=...&to=...&outboundDate=...&passengers[0][type]=...`
- Note that VR's GraphQL API might be protected behind AWS WAF and uses persisted queries. Thus, live fetching via Playwright (headless Chromium), parsing the rendered DOM.
