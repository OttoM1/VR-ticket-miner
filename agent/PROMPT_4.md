## Prompt 4: Search Pipeline Finalization

- agent: GPT-5.6 Sol

#### Optimize the VR ticket search pipeline

- Refactor the SE and CLI.
- Data Fetching & Network Interception
- Instead, parse live data directly from the JSON payload.
- DOM scraping should be left as a secondary fallback.
- Target runtime < 15s.
- Try to normalize station codes and fix date formatting.
- Zero build errors (TS, eslint).
