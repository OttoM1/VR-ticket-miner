# Security Policy

## Supported versions

Security fixes are provided for the latest release on the `main` branch. Older tags and forks are not actively supported unless stated otherwise.

| Version          | Supported |
| ---------------- | --------- |
| Latest on `main` | Yes       |
| Older releases   | No        |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security issue in VR Ticket Miner, report it privately so it can be addressed before public disclosure.

### Preferred channel

Use [GitHub Private Vulnerability Reporting](https://github.com/OttoM1/VR-ticket-miner/security/advisories/new) for this repository.

If private reporting is unavailable, contact the maintainers through the contact details on the [repository profile](https://github.com/OttoM1/VR-ticket-miner) and clearly mark your message as a **security report**.

### In scope

Security issues in this repository, including but not limited to:

- Command injection or unsafe handling of user-supplied CLI arguments
- Insecure defaults in HTTP clients, TLS verification, or redirect handling
- Secrets or credentials committed to the repository or logged to the console
- Dependency vulnerabilities introduced or directly bundled by this project
- Unsafe behaviour in the command-builder web UI (`index.html`) when opened locally

## Secure use

VR Ticket Miner queries third-party services. To reduce risk when running the tool:

- Run only code you trust from official releases or verified commits
- Do not commit API keys, session cookies, or personal travel data to the repository
- Use `--mock` for development and automated testing when live requests are unnecessary
- Keep Node.js and project dependencies up to date
- Review CLI commands before running them, especially when copied from untrusted sources

## Responsible automation

This tool is intended for personal fare research. Automated or high-volume requests against VR’s services may violate their terms of service and can harm availability for other users. Do not use this project to bypass authentication, scrape private data, or attack VR infrastructure.

## Disclaimer

This project is not for commercial use as-is, is not affiliated with VR Group or vr.fi, and was not developed in collaboration with them. See the [README disclaimer](README.md#disclaimer) and VR’s [privacy](https://www.vr.fi/en/privacy) and [legal terms](https://www.vr.fi/en/terms-and-conditions) before use.
