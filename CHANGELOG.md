# Changelog

All changes to **VR Ticket Miner** (starting from [2026-09-12]) are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Background image asset at [`ui/body.jpg`](ui/body.jpg) for the hosted search builder.

### Changed

- Default arrival band (`--band-hours`) is **8** hours (was 4) in the CLI, search builder, and README.
- Rolling search scans **14** consecutive days from the start date (was 7); CLI copy and progress messages updated to match.
- Hosted **search builder** (`index.html`): plain-language labels, user-facing copy (“Find cheaper train tickets”), and step-by-step run instructions; generated command always uses `vr-miner` (removed `npm run dev` / binary toggle).
- Search builder form simplified: dropped mock/return checkboxes and advanced flags (ISO week/year, request delay); date range preview shows a friendly 14-day span.
- Station suggestions use **city names** only (removed duplicate code aliases from the datalist).
- Visual refresh: updated Tailwind palette, translucent panels, and full-viewport background overlay in [`body.css`](body.css).
- Viewports under ~690px show a full-screen notice that the builder is not available at that resolution.
- README install section: clearer steps plus `git -v` / `node -v` checks before clone and build.

### Fixed

- npm package name **`vr-ticket-miner`** (was `vr-ticker-miner`) in `package.json`, lockfile, and GraphQL `User-Agent`.
- Layout typo on the main container (`w-full px-4`).

## [0.1.0] - 2026-09-12

### Added

- [`agent/`](agent/) prompt history pipeline for development iterations.
- Hosted command builder on [GitHub Pages](https://ottom1.github.io/VR-ticket-miner/).
- Open-source governance: [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), and MIT [`LICENCE`](LICENCE).
- Static UI at the repository root (`index.html`, `body.css`, `tailwind.config.js`), relocated from `web/`.

### Changed

- README points to GitHub Pages instead of old `web/` paths.
