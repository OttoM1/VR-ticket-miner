## Prompt 3: Build Errors Fixing

- agent: GPT-5.6 Sol

#### Fix TypeScript build errors

- `bash`: (TS18046: 'el' is of type 'unknown' / TS2584) src/core/playwright-client.ts.

#### Context & Possible Root Cause

- tsconfig.json targets Node but intentionally excludes "DOM".
  Try e.g. following changes:
  - Do NOT add "DOM" to tsconfig.json.
  - Refactor DOM parsing and querySelectorAll loops.
  - Use Playwright locators instead.
  - Verify `npm run build`.
