# StackKit

Production-ready full-stack project generator with zero configuration.

[![npm](https://img.shields.io/npm/v/stackkit)](https://www.npmjs.com/package/stackkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/tariqul420/stackkit)](https://github.com/tariqul420/stackkit)

Scaffold complete full-stack applications in seconds with your choice of framework, database, and authentication—all pre-configured and production-ready.

## Features

- Project ready in under 60 seconds
- Framework support: Next.js, Express, React
- Multiple databases: PostgreSQL, MySQL, MongoDB, SQLite
- Authentication: Better Auth or Auth.js
- Modular architecture - add features incrementally
- TypeScript-first with strict mode
- Production-ready with best practices built-in
- Built-in health diagnostics

## Requirements

- Node.js >= 18
- npm, pnpm, yarn, or bun

## Quick Start

### Create New Project

```bash
# Interactive mode (recommended)
npx stackkit@latest create my-app

# Or specify everything upfront
npx stackkit@latest create my-app \
  --framework nextjs \
  --database prisma-postgresql \
  --auth better-auth
```

### Add Features to Existing Project

```bash
# Add authentication
npx stackkit@latest add

# Verify project health
npx stackkit@latest doctor
```

## Available Options

### Frameworks
- **Next.js** - Full-stack React with App Router
- **Express** - Node.js REST API with TypeScript
- **React** - Frontend SPA with Vite

### Databases
- **Prisma** - PostgreSQL, MySQL, MongoDB, SQLite
- **Mongoose** - MongoDB ODM

### Authentication
- **Better Auth** - TypeScript-first auth for all frameworks
- **Auth.js** - NextAuth.js v5 for Next.js

## Examples

```bash
# Next.js with PostgreSQL and Better Auth
npx stackkit@latest create my-app \
  --framework nextjs \
  --database prisma-postgresql \
  --auth better-auth

# Express API with MongoDB
npx stackkit@latest create my-api \
  --framework express \
  --database mongoose \
  --auth better-auth

# React SPA with authentication
npx stackkit@latest create my-spa \
  --framework react \
  --auth better-auth

# Minimal start, add features later
npx stackkit@latest create my-app --framework nextjs --database none
cd my-app
npx stackkit@latest add
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `create <name>` | Generate new project |
| `add` | Add features to existing project |
| `doctor` | Diagnose project health |
| `list` | Show available options |
| `--help` | Show help for any command |

## What You Get

Every StackKit project includes:
- TypeScript with strict configuration
- ESLint with recommended rules
- Environment variable management
- Git initialization with .gitignore
- Package scripts for dev, build, and production
- Comprehensive README with setup instructions
- Module-specific configurations

## Documentation

Full documentation: https://stackkit.tariqul.dev

- [Quick Start Guide](https://stackkit.tariqul.dev/docs/getting-started/quickstart)
- [CLI Reference](https://stackkit.tariqul.dev/docs/cli/overview)
- [Modules](https://stackkit.tariqul.dev/docs/modules)
- [Troubleshooting](https://stackkit.tariqul.dev/docs/reference/troubleshooting)

## Development

Clone and run locally:

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install
pnpm build
pnpm dev
```

Notes:

- Commands run across the workspace using pnpm workspaces where applicable.
- Use `pnpm -w -r run <script>` to target workspace scripts explicitly.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and code style.

When opening issues or pull requests, please include relevant details (version, Node, package manager, OS, command, reproduction steps).

## Support & Security

- For general questions or feature requests: open an issue or discussion on GitHub.
- For security-sensitive reports: use GitHub Security Advisories (private) or open an issue and mark it with the `security` label — do not post exploit details publicly.

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)

---

Questions? Open an [issue](https://github.com/tariqul420/stackkit/issues) or start a discussion.
