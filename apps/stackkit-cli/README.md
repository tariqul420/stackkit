# StackKit CLI

The main CLI package for StackKit - a production-ready project generator and module system.

## Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

### Test Locally

```bash
# Link globally
pnpm link --global

# Use it anywhere
stackkit init my-app
stackkit list
stackkit add auth
```

## Commands

### `stackkit init [project-name]`

Create a new project from a template.

**Options:**

- `-t, --template <template>` - Template to use
- `--pm <pm>` - Package manager (npm, yarn, pnpm)
- `--no-install` - Skip installing dependencies
- `--no-git` - Skip git initialization
- `-y, --yes` - Skip prompts and use defaults

**Example:**

```bash
stackkit init my-app --template next-prisma-postgres-shadcn --pm pnpm
```

### `stackkit list`

List available templates and modules.

**Options:**

- `-t, --templates` - List only templates
- `-m, --modules` - List only modules

**Example:**

```bash
stackkit list
stackkit list --modules
```

### `stackkit add <module>`

Add a module to your existing project.

**Options:**

- `--provider <provider>` - Specific provider/variant
- `--force` - Overwrite existing files
- `--dry-run` - Show what would be changed
- `--no-install` - Skip installing dependencies

**Example:**

```bash
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
