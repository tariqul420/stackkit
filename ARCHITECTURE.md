# Architecture

## Project Structure

```
stackkit/
├── apps/
│   ├── create-stackkit/    # npx create-stackkit-app
│   └── stackkit-cli/        # npx stackkit add auth
├── modules/                 # Shared auth & database modules
│   ├── auth/
│   └── database/
└── templates/               # Base templates (Next.js, Express, Vite)
    └── bases/
```

## Module System

Each module has:

- `module.json` - Configuration
- `files/` - Files to copy
- Patches for existing files

### module.json Format

```json
{
  "name": "better-auth-nextjs",
  "version": "1.0.0",
  "dependencies": ["better-auth", "@better-auth/prisma"],
  "envVars": ["AUTH_SECRET", "AUTH_URL"],
  "files": ["lib/auth.ts", "api/auth/[...all]/route.ts"],
  "patches": {
    "app/page.tsx": [
      {
        "search": "export default function Home",
        "insert": "import { auth } from '@/lib/auth';\n\n",
        "position": "before"
      }
    ]
  }
}
```

## How It Works

1. **create-stackkit** - Creates new project with base template
2. **stackkit-cli** - Adds modules to existing project
3. Both use shared `/modules` directory
4. Placeholders (`{{lib}}`, `{{router}}`) adapt to framework

## Adding New Modules

See [MODULE_GUIDE.md](docs/MODULE_GUIDE.md) for details.
