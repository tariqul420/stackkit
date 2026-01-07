# stackkit-cli

Main CLI package for StackKit - production-ready project generator with modular architecture.

[![npm](https://img.shields.io/npm/v/stackkit-cli)](https://www.npmjs.com/package/stackkit-cli)

## Installation

```bash
# Global installation
npm install -g stackkit-cli

# Or use directly with npx
npx stackkit-cli@latest init my-app
```

## Usage

```bash
# Create new project
npx stackkit-cli init my-app

# List available resources
npx stackkit-cli list

# Add modules to existing project
npx stackkit-cli add auth
```

## Commands

### `init [project-name]`

Create a new project from a template.

**Options:**
- `--template <name>` - Template to use
- `--pm <npm|yarn|pnpm>` - Package manager (default: auto-detect)
- `--no-install` - Skip dependency installation
- `--no-git` - Skip git initialization
- `--yes` - Skip all prompts

**Examples:**
```bash
npx stackkit-cli init my-app
npx stackkit-cli init my-app --template next-prisma-postgres-shadcn --pm pnpm
npx stackkit-cli init my-app --no-install --no-git --yes
```

### `list`

List available templates and modules.

**Options:**
- `--templates` - Show templates only
- `--modules` - Show modules only

**Examples:**
```bash
npx stackkit-cli list
npx stackkit-cli list --templates
npx stackkit-cli list --modules
```

### `add <module>`

Add a module to your existing project.

**Options:**
- `--dry-run` - Preview changes without applying
- `--force` - Overwrite existing files
- `--no-install` - Skip dependency installation

**Examples:**
```bash
npx stackkit-cli add auth
npx stackkit-cli add auth --dry-run
npx stackkit-cli add auth --force
```

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Link globally for testing
pnpm link --global

# Test locally
stackkit init test-app
```

## Publishing

The package uses automated build process:

```bash
# Version bump
npm version patch|minor|major

# Publish (prepublishOnly will auto-build and copy templates/modules)
npm publish --access public
```

See main [README](../../README.md) for more details.

## License

MIT
