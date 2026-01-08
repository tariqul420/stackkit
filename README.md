# StackKit

⚡ **Production-ready project generator with modular composition**

[![npm](https://img.shields.io/npm/v/stackkit-cli)](https://www.npmjs.com/package/stackkit-cli)
[![npm](https://img.shields.io/npm/v/create-stackkit-app)](https://www.npmjs.com/package/create-stackkit-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick Start

### Create a New Project

```bash
npx create-stackkit-app my-app
```

Interactive wizard guides you through:

- **Framework**: Next.js, Express, React (Vite)
- **Database**: Prisma + PostgreSQL/MongoDB, Mongoose, Drizzle, None
- **Auth**: Auth.js, Better Auth, Clerk, NextAuth, None
- **Language**: TypeScript or JavaScript
- **Package Manager**: pnpm, npm, yarn

Automatically installs dependencies and initializes git.

### Add Modules to Existing Project

```bash
npx stackkit-cli add auth
npx stackkit-cli add database
```

## Features

- 🧙 **Wizard-style setup** - Interactive project creation
- 🔧 **Modular composition** - Mix and match framework, database, auth
- 🛡️ **TypeScript & JavaScript** - Auto-converts based on selection
- ⚡ **Fast setup** - Dependencies auto-installed
- 📦 **Add modules anytime** - Extend existing projects with new features
- ✅ **Production-ready** - Best practices and latest versions built-in
- 🎯 **Zero duplication** - Shared module system for consistency

## Architecture

StackKit uses a unified module system:

- **`/modules`** - Shared auth and database modules used by both CLIs
- **`/templates/bases`** - Base framework templates (Next.js, Express, React)
- **Two CLIs**: `create-stackkit-app` (project creation) and `stackkit-cli` (add modules)

See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Available Modules

### Authentication
- **Better Auth** - Next.js, Express, React
- **Auth.js v5** - Next.js, Express  
- **NextAuth.js** - Next.js (legacy)
- **Clerk** - Next.js, Express, React

### Databases
- **Prisma** - PostgreSQL, MongoDB
- **Drizzle** - PostgreSQL
- **Mongoose** - MongoDB

## CLI Commands

### create-stackkit-app

Create a complete project with your chosen stack:

```bash
npx create-stackkit-app my-app
```

### stackkit-cli

Manage modules in existing projects:

```bash
# Add authentication
npx stackkit-cli add auth

# Add database
npx stackkit-cli add database --provider prisma-postgresql

# List available modules
npx stackkit-cli list

# List only auth modules
npx stackkit-cli list --modules
```

## Development

### Setup

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
cd apps/create-stackkit
pnpm build

cd apps/stackkit-cli
pnpm build
```

### Test Locally

```bash
# Test create-stackkit-app
cd apps/create-stackkit
npm run build
npx . my-test-app

# Test stackkit-cli
cd apps/stackkit-cli
npm run build
cd /path/to/existing/project
npx /path/to/stackkit/apps/stackkit-cli/bin/stackkit.js add auth
```

## Project Structure

```
stackkit/
├── apps/
│   ├── create-stackkit/        # Project creation CLI
│   └── stackkit-cli/           # Module management CLI
├── modules/                     # Unified module system (shared)
│   ├── auth/                   # Auth modules
│   │   ├── better-auth-nextjs/
│   │   ├── authjs-nextjs/
│   │   ├── clerk-nextjs/
│   │   └── ...
│   └── database/               # Database modules
│       ├── prisma-postgresql/
│       ├── drizzle-postgresql/
│       └── ...
├── templates/
│   └── bases/                  # Base framework templates
│       ├── nextjs-base/
│       ├── express-base/
│       └── react-vite-base/
├── docs/
│   └── MODULE_GUIDE.md         # How to create modules
├── ARCHITECTURE.md              # System architecture
└── README.md
```

## Contributing

We welcome contributions! Here's how you can help:

### Adding New Modules

See [docs/MODULE_GUIDE.md](docs/MODULE_GUIDE.md) for a comprehensive guide on creating new modules.

Quick example:

1. Create module directory: `modules/auth/my-auth-provider/`
2. Add `module.json` with metadata
3. Add template files in `files/` subdirectory
4. Test with both CLIs
5. Submit PR

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly with both CLIs
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## How It Works

### create-stackkit-app (Composition)

1. User selects framework, database, auth
2. Copies base template from `/templates/bases/{framework}/`
3. Merges selected modules from `/modules/`
4. Installs dependencies
5. Initializes git

### stackkit-cli (Add to Existing)

1. Detects existing project structure
2. Loads module from `/modules/`
3. Copies files with placeholder replacement
4. Updates package.json and .env
5. Installs dependencies

Both CLIs use the **same module definitions** - no duplication!

## Roadmap

- [x] Unified module system
- [x] Next.js, Express, React (Vite) support
- [x] Prisma, Drizzle, Mongoose ORMs
- [x] Multiple auth providers
- [ ] More templates (Remix, Astro, SvelteKit)
- [ ] Payment integrations (Stripe, PayPal)
- [ ] Email services (Resend, SendGrid)
- [ ] Analytics modules
- [ ] CI/CD setup automation
- [ ] Docker configurations
- [ ] Testing setup
- [ ] E2E testing modules

## Support

- 📚 [Documentation](https://github.com/tariqul420/stackkit)
- 📖 [Module Guide](docs/MODULE_GUIDE.md)
- 🏗️ [Architecture](ARCHITECTURE.md)
- 💡 [Discussions](https://github.com/tariqul420/stackkit/discussions)
- 🐛 [Issues](https://github.com/tariqul420/stackkit/issues)

## License

MIT © [Tariqul Islam](https://github.com/tariqul420)

---

<div align="center">
  Made with ❤️ for developers who value clean, maintainable code
</div>

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
