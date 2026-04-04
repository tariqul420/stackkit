# StackKit CLI

Production-ready full-stack project generator.

## Usage

No installation required:

```bash
npx stackkit@latest <command>
```

## Commands

### create

Scaffold a new project:

```bash
# Interactive — follow the prompts
npx stackkit@latest create my-app

# With flags — skip the prompts
npx stackkit@latest create my-app \
  --framework nextjs \
  --database prisma-postgresql \
  --auth better-auth
```

**Options:**

| Flag                    | Values                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `--framework, -f`       | `nextjs`, `express`, `react`                                                               |
| `--database, -d`        | `prisma-postgresql`, `prisma-mysql`, `prisma-sqlite`, `prisma-mongodb`, `mongoose`, `none` |
| `--auth, -a`            | `better-auth`, `none`                                                                      |
| `--ui, -u`              | `shadcn`                                                                                   |
| `--storage-provider`    | `cloudinary`                                                                               |
| `--language, -l`        | `typescript`, `javascript`                                                                 |
| `--package-manager, -p` | `pnpm`, `npm`, `yarn`, `bun`                                                               |
| `--yes, -y`             | Use defaults, skip prompts                                                                 |
| `--skip-install`        | Skip dependency installation                                                               |
| `--no-git`              | Skip git initialization                                                                    |

### add

Add a module to an existing project:

```bash
npx stackkit@latest add
```

Interactively select and install modules (database, auth, ui, storage, components).

### doctor

Diagnose project health:

```bash
npx stackkit@latest doctor

# Verbose output
npx stackkit@latest doctor --verbose

# JSON output (for CI/CD)
npx stackkit@latest doctor --json

# Treat warnings as errors
npx stackkit@latest doctor --strict
```

### list

Show available frameworks and modules:

```bash
npx stackkit@latest list
npx stackkit@latest list --frameworks
npx stackkit@latest list --modules
```

## Supported stack

| Category       | Options                                                  |
| -------------- | -------------------------------------------------------- |
| Frameworks     | Next.js (App Router), Express (TypeScript), React (Vite) |
| Databases      | Prisma (PostgreSQL, MySQL, SQLite, MongoDB), Mongoose    |
| Authentication | Better Auth (all frameworks)                             |
| UI             | Shadcn UI (Next.js, React)                               |
| Storage        | Cloudinary (Express)                                     |
| Components     | TiptapEditor, DataTable, SearchBar, FilterBar, and more  |

## Examples

```bash
# Full-stack Next.js
npx stackkit@latest create my-app \
  --framework nextjs \
  --database prisma-postgresql \
  --auth better-auth

# Express API with MongoDB
npx stackkit@latest create my-api \
  --framework express \
  --database mongoose

# React SPA with auth
npx stackkit@latest create my-spa \
  --framework react \
  --auth better-auth
```

## Links

- [Documentation](https://stackkit.tariqul.dev)
- [GitHub](https://github.com/tariqul420/stackkit)
- [Issues](https://github.com/tariqul420/stackkit/issues)

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)
