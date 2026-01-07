# create-stackkit-app

Quick project scaffolder for StackKit - create production-ready Next.js projects instantly.

[![npm](https://img.shields.io/npm/v/create-stackkit-app)](https://www.npmjs.com/package/create-stackkit-app)

## Usage

```bash
# npm
npx create-stackkit-app@latest my-app

# pnpm
pnpm dlx create-stackkit-app@latest my-app

# yarn
yarn dlx create-stackkit-app@latest my-app

# bun
bunx create-stackkit-app@latest my-app
```

## What It Does

`create-stackkit-app` is a thin wrapper around `stackkit-cli` that provides quick project initialization without global installation.

It automatically:
1. Installs `stackkit-cli` temporarily
2. Runs `stackkit init` with your options
3. Creates a production-ready Next.js project

## Options

All `stackkit-cli init` options are supported:

```bash
npx create-stackkit-app my-app --template next-prisma-postgres-shadcn --pm pnpm

npx create-stackkit-app my-app --no-install --no-git --yes
```

**Available options:**
- `--template <name>` - Template to use
- `--pm <npm|yarn|pnpm>` - Package manager
- `--no-install` - Skip dependency installation
- `--no-git` - Skip git initialization
- `--yes` - Skip all prompts

## What's Included

The default template includes:
- ✅ Next.js 15 with App Router
- ✅ TypeScript
- ✅ Prisma ORM + PostgreSQL
- ✅ shadcn/ui components
- ✅ Tailwind CSS
- ✅ Zod validation
- ✅ ESLint + Prettier

## Next Steps

After creating your project:

```bash
cd my-app
pnpm install
pnpm dev
```

Add features with modules:

```bash
npx stackkit-cli add auth
```

## Full CLI

For more features, use the full CLI:

```bash
npm install -g stackkit-cli

stackkit init my-app
stackkit list
stackkit add auth
```

See [stackkit-cli](https://www.npmjs.com/package/stackkit-cli) for details.

## License

MIT
