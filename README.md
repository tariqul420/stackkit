# StackKit

⚡ **Production-ready project generator with modular composition**

[![npm](https://img.shields.io/npm/v/stackkit-cli)](https://www.npmjs.com/package/stackkit-cli)
[![npm](https://img.shields.io/npm/v/create-stackkit-app)](https://www.npmjs.com/package/create-stackkit-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick Start

**Create a new project:**

```bash
npx create-stackkit-app my-app
```

**Add modules to existing project:**

```bash
npx stackkit-cli add auth
npx stackkit-cli add database
```

## Features

- 🧙 **Interactive wizard** - Choose framework, database, and auth
- 🔧 **Modular** - Mix and match components
- 📦 **Extensible** - Add features anytime
- ⚡ **Fast** - Auto-install dependencies
- ✅ **Production-ready** - Best practices built-in

## Available Stacks

### Frameworks

- Next.js 16 (App Router)
- Express
- React (Vite)

### Authentication

- Better Auth, Auth.js v5, NextAuth

### Databases

- Prisma (PostgreSQL/MongoDB)
- Mongoose (MongoDB)

## Contributing

Want to add a new module? See [docs/MODULE_GUIDE.md](docs/MODULE_GUIDE.md)

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install
pnpm build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)

---

**Questions?** Open an [issue](https://github.com/tariqul420/stackkit/issues) or [discussion](https://github.com/tariqul420/stackkit/discussions)
