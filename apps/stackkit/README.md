# StackKit CLI

Production-ready full-stack project generator.

## Installation

No installation required. Use npx to get the latest version:

```bash
npx stackkit@latest <command>
```

## Commands

### create

Generate a new project:

```bash
# Interactive mode
npx stackkit@latest create my-app

# With options
npx stackkit@latest create my-app \
  --framework nextjs \
  --database prisma-postgresql \
  --auth better-auth \
  --language typescript
```

**Options:**
- `--framework, -f` - nextjs, express, react
- `--database, -d` - prisma-postgresql, prisma-mysql, prisma-sqlite, prisma-mongodb, mongoose, none
- `--auth, -a` - better-auth, authjs, none
- `--language, -l` - typescript, javascript
- `--package-manager, -p` - pnpm, npm, yarn, bun
- `--yes, -y` - Use defaults
- `--skip-install` - Don't install dependencies
- `--no-git` - Don't initialize git

### add

Add features to existing project:

```bash
npx stackkit@latest add
```

Interactively select and install modules.

### doctor

Diagnose project health:

```bash
npx stackkit@latest doctor

# Verbose output
npx stackkit@latest doctor --verbose

# JSON output (for CI/CD)
npx stackkit@latest doctor --json
```

### list

Show available options:

```bash
npx stackkit@latest list
```

## Supported Technologies

**Frameworks:**
- Next.js (App Router)
- Express (TypeScript API)
- React (Vite SPA)

**Databases:**
- Prisma (PostgreSQL, MySQL, SQLite, MongoDB)
- Mongoose (MongoDB)

**Authentication:**
- Better Auth (All frameworks)
- Auth.js (Next.js only)

## Examples

```bash
# Full-stack Next.js
npx stackkit@latest create my-app --framework nextjs --database prisma-postgresql --auth better-auth

# Express API
npx stackkit@latest create my-api --framework express --database mongoose

# React frontend
npx stackkit@latest create my-spa --framework react --auth better-auth
```

## Links

- **Documentation**: https://stackkit.tariqul.dev
- **GitHub**: https://github.com/tariqul420/stackkit
- **Issues**: https://github.com/tariqul420/stackkit/issues

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)
