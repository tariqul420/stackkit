# stackkit-cli

Add authentication and database modules to existing projects.

## Usage

```bash
# Check project health and compatibility
npx stackkit-cli doctor

# Add authentication
npx stackkit-cli add auth

# Add database
npx stackkit-cli add database

# List available modules
npx stackkit-cli list
```

## Features

- **Auto-detects** your framework (Next.js, Express, React)
- **Shows compatible modules** for your project
- **Installs dependencies** automatically
- **Configures everything** - files, env vars, and setup
- **Health checks** with `doctor` command

## Available Modules

### Authentication

- Better Auth (Next.js, Express, React)

### Database

- Prisma with PostgreSQL or MongoDB (Next.js, Express)
- Mongoose with MongoDB (Next.js, Express)

## Commands

### `doctor`

Check your project's health and compatibility with StackKit modules.

```bash
stackkit doctor                    # Basic health check
stackkit doctor --verbose         # Detailed output
stackkit doctor --json            # Machine-readable JSON output
stackkit doctor --strict          # Treat warnings as errors
```

The doctor command:
- Detects your project type and framework
- Checks Node.js version compatibility
- Identifies installed StackKit modules
- Validates environment variables
- Checks for configuration conflicts
- Provides actionable next steps

## Documentation

Full documentation: [stackkit.dev](https://stackkit.dev) | [GitHub](https://github.com/tariqul420/stackkit/issues)
