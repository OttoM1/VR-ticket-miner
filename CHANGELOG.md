# Changelog

All changes to **VR Ticket Miner** (starting from [2026-09-12]) are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Background image asset at [`ui/body.jpg`](ui/body.jpg) for the hosted search builder.
- **Disclaimer** in [`README.md`](README.md) and [`SECURITY.md`](SECURITY.md): not for commercial use as-is; not affiliated with VR / vr.fi; links to VR privacy and terms.
- **Bash check pipeline** under [`bash/`](bash/):
  - [`env.sh`](bash/env.sh) — Node 20+, bash, and git compatibility checks.
  - [`run_all.sh`](bash/run_all.sh) — runs `env.sh`, then [`agent.sh`](bash/agent.sh), [`miner_script.sh`](bash/miner_script.sh), and [`local_smoke.sh`](bash/local_smoke.sh); lock file avoids overlapping runs.
  - [`miner_script.sh`](bash/miner_script.sh) — offline mock miner tests (14-day scan, route output, student vs adult pricing, invalid `--arrive`).
  - [`agent.sh`](bash/agent.sh) — agent prompt pipeline smoke check (`agent/PROMPT_*.md`).
- npm script **`check-bash`** → `bash bash/run_all.sh`.
- **Editor onboarding** (VS Code / Cursor): [`.vscode/tasks.json`](.vscode/tasks.json) (`runOn: folderOpen`), [`.vscode/settings.json`](.vscode/settings.json), optional [`.vscode/terminals.json`](.vscode/terminals.json), and [`VR-ticket-miner.code-workspace`](VR-ticket-miner.code-workspace).
- [`bash/_POSIX.md`](bash/_POSIX.md) — short notes on shell commands, `awk`, `sed`, and `exec` for the bash scripts.
- **`--direct-only`** CLI flag and search-builder checkbox: keep only single-leg (no change) trips; trips track `legCount` from VR API legs or train labels.
- **Expanded station list** in [`src/core/stations.ts`](src/core/stations.ts) and the hosted datalist (33 Finnish cities).
- **Arrival modes**: `--band-hours 0` for any arrival time that day; default **4-hour** window ending at `--arrive` (search builder: **4h window** vs **Any time**).
- **Mobile-friendly search builder** (viewports ≤690px): usable layout without changing desktop theme above that breakpoint.
- **Native control theming** in [`body.css`](body.css) (date/time pickers, datalist, checkboxes) aligned with the dark VR-green UI.

### Changed

- Default arrival band (`--band-hours`) is **4** hours in the CLI and search builder (**8** was the previous default).
- `--arrive` is optional when `--band-hours 0`; validation errors in [`src/cli/index.ts`](src/cli/index.ts) guide correct usage.
- Rolling search scans **14** consecutive days from the start date (was 7); CLI copy and progress messages updated to match.
- Hosted **search builder** (`index.html`): plain-language labels, user-facing copy (“Find cheaper train tickets”), and step-by-step run instructions; generated command always uses `vr-miner` (removed `npm run dev` / binary toggle).
- Search builder form: arrival filter segmented control (replaces free-form “hours before”); **Direct trains only** option; date range preview explains the active filter.
- Station suggestions use **city names** only (removed duplicate code aliases from the datalist).
- Visual refresh: updated Tailwind palette, translucent panels, and full-viewport background overlay in [`body.css`](body.css).
- README install section: clearer steps plus `git -v` / `node -v` checks before clone and build.
- README **Bash checks** section: one-time “Allow Automatic Tasks” setup, manual `check-bash`, and workspace open flow.

### Fixed

- npm package name **`vr-ticket-miner`** (was `vr-ticker-miner`) in `package.json`, lockfile, and GraphQL `User-Agent`.
- Layout typo on the main container (`w-full px-4`).
- [`bash/env.sh`](bash/env.sh) broken `if`/`fi` and `exec $SHELL` preventing scripted use; now exits with proper status codes.
- Folder-open checks **appearing to hang** when `run_all.sh` started twice (task + Terminals Manager `autorun`); `autorun` disabled, `instanceLimit: 1`, and run lock added.
- Duplicate Pasila / Seinäjoki entries in the station resolver.

### Removed

- Full-screen “not available on this resolution” blocker on narrow viewports (replaced by responsive layout).

## [0.1.0] - 2026-09-12

### Added

- [`agent/`](agent/) prompt history pipeline for development iterations.
- Hosted command builder on [GitHub Pages](https://ottom1.github.io/VR-ticket-miner/).
- Open-source governance: [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), and MIT [`LICENCE`](LICENCE).
- Static UI at the repository root (`index.html`, `body.css`, `tailwind.config.js`), relocated from `web/`.

### Changed

- README points to GitHub Pages instead of old `web/` paths.
