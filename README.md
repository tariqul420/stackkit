# StackKit

Production-ready full-stack project generator with zero configuration.

[![npm](https://img.shields.io/npm/v/stackkit)](https://www.npmjs.com/package/stackkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/tariqul420/stackkit)](https://github.com/tariqul420/stackkit)

Scaffold complete full-stack applications in seconds with your choice of framework, database, and authentication—all pre-configured and production-ready.

## What it does

Answer a few prompts. StackKit generates a project with everything already configured:

- Your choice of framework: **Next.js**, **Express**, or **React**
- Database integration with **Prisma** or **Mongoose**
- Authentication via **Better Auth**
- UI components from **Shadcn UI**
- File storage with **Cloudinary**
- TypeScript strict mode, ESLint, and documented `.env` templates — all included

No manual wiring. No dependency hunting. Just working code.

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

## Supported stack

| Category       | Options                                                    |
| -------------- | ---------------------------------------------------------- |
| Frameworks     | Next.js (App Router), Express (TypeScript), React (Vite)   |
| Databases      | Prisma (PostgreSQL, MySQL, SQLite, MongoDB), Mongoose       |
| Authentication | Better Auth (all frameworks)                               |
| UI             | Shadcn UI (Next.js, React)                                 |
| Storage        | Cloudinary (Express)                                       |
| Components     | TiptapEditor, DataTable, SearchBar, FilterBar, and more    |

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

## Commands

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `create <name>` | Scaffold a new project interactively      |
| `add`           | Add a database, auth, or UI module        |
| `doctor`        | Diagnose issues and missing configuration |
| `list`          | Show all supported frameworks and modules |

## What every project includes

- TypeScript with strict mode enabled
- ESLint with recommended rules
- `.env.example` with every variable documented
- Git initialized with a sensible `.gitignore`
- `dev`, `build`, and `start` scripts ready to use
- A generated README with setup and deployment instructions

## Documentation

Full docs at **[stackkit.tariqul.dev](https://stackkit.tariqul.dev)**

- [Quick Start](https://stackkit.tariqul.dev/docs/getting-started/quickstart)
- [CLI Reference](https://stackkit.tariqul.dev/docs/cli/overview)
- [Modules](https://stackkit.tariqul.dev/docs/modules/authentication/better-auth)
- [Troubleshooting](https://stackkit.tariqul.dev/docs/reference/troubleshooting)

## Development

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install
pnpm build
```

## Contributing

Contributions are welcome — bug reports, feature requests, and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)

---

Questions? Open an [issue](https://github.com/tariqul420/stackkit/issues) or start a [discussion](https://github.com/tariqul420/stackkit/discussions).
