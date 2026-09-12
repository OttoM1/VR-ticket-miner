# Changelog

All changes to **VR Ticket Miner** (starting from [2026-09-12]) are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Default arrival band (`--band-hours`) is **8** hours (was 4) in the CLI, command builder, and README.
- Rolling search scans **14** consecutive days from the start date (was 7).

### Changed (command builder)

- Viewports under ~690px show a full-screen notice that the builder is not available at that resolution; base `body.css` layout updated for full-viewport styling.

## [0.1.0] - 2026-09-12

### Added

- [`agent/`](agent/) prompt history pipeline for development iterations.
- Hosted command builder on [GitHub Pages](https://ottom1.github.io/VR-ticket-miner/).
- Open-source governance: [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), and MIT [`LICENCE`](LICENCE).
- Static UI at the repository root (`index.html`, `body.css`, `tailwind.config.js`), relocated from `web/`.

### Changed

- README points to GitHub Pages instead of local `web/` paths.
