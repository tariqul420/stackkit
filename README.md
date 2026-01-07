# StackKit

<div align="center">
  <h3>⚡ Production-Ready Project Generator & Module CLI</h3>
  <p>Create modern web applications with best practices baked in.</p>
  
  [![npm version](https://img.shields.io/npm/v/stackkit-cli)](https://www.npmjs.com/package/stackkit-cli)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
</div>

---

## 🚀 Quick Start

Create a new project in seconds:

```bash
npx create-stackkit@latest my-app
```

Or use the full CLI:

```bash
npx stackkit-cli@latest init my-app
```

## ✨ Features

- 🎯 **Production-Ready Templates** - Start with battle-tested setups
- 🔧 **Modular Architecture** - Add features on-demand
- 🛡️ **Type-Safe** - Built with TypeScript for reliability
- ⚡ **Fast** - Optimized for speed and developer experience
- 🎨 **Opinionated** - Best practices out of the box
- 🔄 **Idempotent** - Safe to run multiple times

## 📦 What's Included

### Templates

- **Next.js + Prisma + PostgreSQL + shadcn/ui**
  - Next.js 15 with App Router
  - Prisma ORM with PostgreSQL
  - shadcn/ui components
  - Tailwind CSS
  - TypeScript
  - Environment validation (Zod)
  - ESLint + Prettier
  - Health check API

### Modules

- **Authentication** (`stackkit add auth`)
  - NextAuth.js integration
  - Multiple provider support
  - App Router & Pages Router compatible
  - Session management
  - Protected routes

*More modules coming soon: payments, emails, analytics, etc.*

## 🎯 Usage

### Create a New Project

Interactive mode:
```bash
npx create-stackkit@latest
```

With options:
```bash
npx create-stackkit@latest my-app --template next-prisma-postgres-shadcn --pm pnpm
```

### List Available Resources

```bash
npx stackkit list           # List all templates and modules
npx stackkit list --templates  # List only templates
npx stackkit list --modules    # List only modules
```

### Add Modules to Existing Projects

Add authentication:
```bash
npx stackkit add auth
```

With options:
```bash
npx stackkit add auth --provider nextauth --force
```

Dry run (preview changes):
```bash
npx stackkit add auth --dry-run
```

## 🛠️ CLI Options

### `stackkit init`

Create a new project from a template.

```bash
stackkit init [project-name] [options]
```

Options:
- `-t, --template <template>` - Template to use
- `--pm <pm>` - Package manager (npm, yarn, pnpm)
- `--no-install` - Skip installing dependencies
- `--no-git` - Skip git initialization
- `-y, --yes` - Skip prompts and use defaults

### `stackkit add`

Add a module to your existing project.

```bash
stackkit add <module> [options]
```

Options:
- `--provider <provider>` - Specific provider/variant
- `--force` - Overwrite existing files
- `--dry-run` - Show what would be changed
- `--no-install` - Skip installing dependencies

### `stackkit list`

List available templates and modules.

```bash
stackkit list [options]
```

Options:
- `-t, --templates` - List only templates
- `-m, --modules` - List only modules

## 🎓 How It Works

1. **Templates**: Full project setups copied to your target directory
2. **Modules**: Feature additions that intelligently integrate with your existing code
3. **Detection**: Automatically detects your project structure (router type, language, etc.)
4. **Idempotency**: Safe to run multiple times - won't duplicate code

## 🏗️ Project Structure

```
stackkit/
├── apps/
│   ├── stackkit-cli/           # Main CLI package
│   └── create-stackkit/        # NPX wrapper
├── templates/                   # Project templates
│   └── next-prisma-postgres-shadcn/
├── modules/                     # Feature modules
│   └── auth/
│       └── nextauth/
└── docs/                        # Documentation
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📝 License

MIT © [Your Name](LICENSE)

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Prisma](https://www.prisma.io)
- [NextAuth.js](https://next-auth.js.org)
- [shadcn/ui](https://ui.shadcn.com)
- [Commander.js](https://github.com/tj/commander.js)

## 🗺️ Roadmap

- [ ] More templates (Remix, Astro, SvelteKit)
- [ ] More modules (Stripe, Resend, Analytics)
- [ ] Web UI for browsing templates
- [ ] Template customization wizard
- [ ] CI/CD setup automation
- [ ] Docker configurations
- [ ] Database seeding utilities

## 💬 Support

- 📚 [Documentation](https://github.com/yourusername/stackkit)
- 💡 [Discussions](https://github.com/yourusername/stackkit/discussions)
- 🐛 [Issues](https://github.com/yourusername/stackkit/issues)

---

<div align="center">
  Made with ❤️ by the StackKit team
</div>

