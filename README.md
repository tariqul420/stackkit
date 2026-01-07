# StackKit

⚡ **Production-ready project generator with modular architecture**

[![npm](https://img.shields.io/npm/v/stackkit-cli)](https://www.npmjs.com/package/stackkit-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick Start

```bash
# Create new project
npx create-stackkit-app my-app

# Add modules to existing project
npx stackkit-cli add auth
```

## Features

- 🎯 Production-ready templates with best practices
- 🔧 Add modules to existing projects
- 🛡️ TypeScript support
- ⚡ Fast setup with multiple package managers
- 🔄 Idempotent operations

## Commands

### Create Project

```bash
npx create-stackkit-app my-app
```

Options:
- `--template <name>` - Choose template (default: next-prisma-postgres-shadcn)
- `--pm <npm|yarn|pnpm>` - Package manager
- `--no-install` - Skip dependency installation
- `--no-git` - Skip git initialization

### List Resources

```bash
npx stackkit-cli list                # All templates and modules
npx stackkit-cli list --templates    # Templates only
npx stackkit-cli list --modules      # Modules only
```

### Add Modules

```bash
npx stackkit-cli add auth            # Add authentication
npx stackkit-cli add auth --dry-run  # Preview changes
npx stackkit-cli add auth --force    # Overwrite existing files
```

## Available Templates

**next-prisma-postgres-shadcn**
- Next.js 15 App Router
- Prisma ORM + PostgreSQL
- shadcn/ui components
- TypeScript, Tailwind CSS
- Zod validation, ESLint + Prettier

## Available Modules

**auth** - NextAuth.js authentication
- Multiple providers
- App Router & Pages Router support
- Session management

## Development

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Test locally
cd apps/stackkit-cli && pnpm link --global
stackkit init test-app
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © [StackKit](https://github.com/tariqul420/stackkit)

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

