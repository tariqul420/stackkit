# create-stackkit-app

Production-ready project generator with interactive wizard setup.

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

## Interactive Wizard

The wizard guides you through project setup:

1. **Framework Selection**
   - Next.js
   - Express.js
   - React (Vite)
   - Astro

2. **Database/ORM**
   - Prisma + PostgreSQL
   - Prisma + MongoDB
   - Mongoose + MongoDB
   - Drizzle + PostgreSQL
   - None

3. **Authentication**
   - Auth.js (NextAuth)
   - Better Auth
   - Clerk
   - None

4. **Language**
   - TypeScript _(recommended)_
   - JavaScript

5. **Package Manager**
   - pnpm _(recommended)_
   - npm
   - yarn

## Automatic Setup

After answering questions, the tool automatically:

✅ Creates project files  
✅ Installs dependencies  
✅ Initializes git repository

No manual `npm install` or `git init` needed.

## What's Included

Default Next.js + Prisma + PostgreSQL template:

- ⚡ Next.js 15 with App Router
- 🛡️ TypeScript
- 🗄️ Prisma ORM + PostgreSQL
- 🎨 shadcn/ui components
- 💅 Tailwind CSS
- ✅ Zod validation
- 🔧 ESLint + Prettier

## Next Steps

After creating your project:

```bash
cd my-app
pnpm dev
```

Add modules to existing projects:

```bash
npx stackkit-cli add auth
```

## Full CLI

For advanced features:

```bash
npm install -g stackkit-cli

stackkit list    # View all templates/modules
stackkit add auth
```

See [stackkit-cli](https://www.npmjs.com/package/stackkit-cli) for details.

## License

MIT
