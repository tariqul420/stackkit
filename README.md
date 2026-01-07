# StackKit

⚡ **Production-ready project generator with modular composition**

[![npm](https://img.shields.io/npm/v/stackkit-cli)](https://www.npmjs.com/package/stackkit-cli)
[![npm](https://img.shields.io/npm/v/create-stackkit-app)](https://www.npmjs.com/package/create-stackkit-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick Start

```bash
npx create-stackkit-app my-app
```

Interactive wizard guides you through:

- **Framework**: Next.js, Express, React (Vite), Astro
- **Database**: Prisma + PostgreSQL/MongoDB, Mongoose, Drizzle, None
- **Auth**: Auth.js, Better Auth, Clerk, None
- **Language**: TypeScript or JavaScript
- **Package Manager**: pnpm, npm, yarn

Automatically installs dependencies and initializes git.

## Features

- 🧙 **Wizard-style setup** - Interactive project creation
- 🔧 **Modular composition** - Mix and match framework, database, auth
- 🛡️ **TypeScript & JavaScript** - Auto-converts based on selection
- ⚡ **Fast setup** - Dependencies auto-installed
- 📦 **Add modules** - Extend existing projects
- ✅ **Production-ready** - Best practices built-in

## Commands

### Create Project

```bash
npx create-stackkit-app my-app
```

### Add Modules to Existing Project

```bash
npx stackkit-cli add auth
```

### List Available Templates/Modules

```bash
npx stackkit-cli list
```

## Development

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install
pnpm build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)

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
