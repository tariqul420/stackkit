# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately instead of opening a public issue.

- Do not disclose the issue publicly until it has been resolved.
- Include steps to reproduce, affected versions, and potential impact.

## Supported Versions

Only the latest version of this project receives security fixes.

## Security Practices in This Project

- Authentication is handled exclusively by [Better Auth](https://www.better-auth.com) — no custom password/session/token logic is implemented.
- `helmet` sets secure HTTP headers by default.
- `express-rate-limit` protects against brute-force and abuse on all routes, with a stricter limiter on `/api/auth/*`.
- All request input is validated with Zod schemas before reaching a controller.
- Secrets (`BETTER_AUTH_SECRET`, database credentials, etc.) must be provided via environment variables and never committed to source control.
- Dependencies should be kept up to date; run `pnpm audit` regularly.
