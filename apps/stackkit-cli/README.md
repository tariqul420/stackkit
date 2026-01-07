# stackkit-cli

Main CLI package for StackKit.

## Installation

```bash
npm install -g stackkit-cli
```

## Usage

```bash
stackkit init my-app                    # Create project
stackkit list                           # List resources
stackkit add auth                       # Add module
```

## Development

```bash
pnpm install                            # Install dependencies
pnpm build                              # Build package
pnpm link --global                      # Link globally
```

## Commands

**init** - Create new project
- `--template <name>` - Template name
- `--pm <npm|yarn|pnpm>` - Package manager
- `--no-install` - Skip dependency installation
- `--no-git` - Skip git initialization

**list** - List available resources
- `--templates` - Templates only
- `--modules` - Modules only

**add** - Add module to project
- `--dry-run` - Preview changes
- `--force` - Overwrite existing files
- `--no-install` - Skip dependency installation

See main [README](../../README.md) for more details.
stackkit add auth
stackkit add auth --dry-run
stackkit add auth --force
```

## Architecture

### Commands (`src/commands/`)

- `init.ts` - Project initialization
- `list.ts` - List resources
- `add.ts` - Add modules

### Utils (`src/utils/`)

- `detect.ts` - Project detection (framework, router, language)
- `files.ts` - File operations (copy, create, read)
- `package-manager.ts` - Package manager detection and execution
- `json-editor.ts` - Safe JSON file editing
- `env-editor.ts` - Environment variable management
- `code-inject.ts` - Idempotent code injection
- `logger.ts` - Consistent CLI output

### Types (`src/types/`)

TypeScript type definitions for templates, modules, and options.

## Publishing

Before publishing to npm:

1. Update version in package.json
2. Build the package: `pnpm build`
3. Test locally: `pnpm link --global`
4. Publish: `npm publish --access public`

## License

MIT
