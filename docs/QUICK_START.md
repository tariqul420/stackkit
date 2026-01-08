# Quick Start Guide for Developers

This guide helps you quickly understand and work with StackKit's codebase.

## 5-Minute Overview

### What is StackKit?

StackKit is a project generator with two CLIs:

1. **create-stackkit-app** - Create new projects
2. **stackkit-cli** - Add modules to existing projects

### Key Concept: Unified Modules

Both CLIs share the same module system:

```
modules/
├── auth/               # Authentication modules
│   ├── better-auth-nextjs/
│   ├── clerk-nextjs/
│   └── ...
└── database/           # Database modules
    ├── prisma-postgresql/
    ├── drizzle-postgresql/
    └── ...
```

Each module has:

- `module.json` - Metadata, dependencies, env vars
- `files/` - Template files to copy

## Quick Commands

```bash
# Setup
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install

# Build everything
pnpm build

# Test create-stackkit-app
cd apps/create-stackkit
npm run build
npx . my-test-app

# Test stackkit-cli
cd apps/stackkit-cli
npm run build
cd /tmp && npx create-stackkit-app test-proj
cd test-proj
npx /path/to/stackkit-cli add auth
```

## File Structure Cheat Sheet

```
stackkit/
├── apps/
│   ├── create-stackkit/        # "npx create-stackkit-app"
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   └── lib/
│   │   │       └── create-project.ts  # Main logic
│   │   └── package.json
│   │
│   └── stackkit-cli/           # "npx stackkit-cli"
│       ├── src/
│       │   ├── index.ts        # CLI setup
│       │   └── commands/
│       │       ├── add.ts      # Add modules
│       │       └── list.ts     # List modules
│       └── package.json
│
├── modules/                     # ⭐ Single source of truth
│   ├── auth/
│   │   └── {provider}/
│   │       ├── module.json     # Metadata
│   │       └── files/          # Templates
│   └── database/
│
├── templates/
│   └── bases/                   # Base templates only
│       ├── nextjs-base/
│       ├── express-base/
│       └── react-vite-base/
│
├── shared/                      # Utilities
│   ├── module-loader.ts        # Load modules
│   └── validation.ts           # Validate modules
│
└── docs/
    └── MODULE_GUIDE.md         # How to create modules
```

## Common Tasks

### Add a New Auth Module

1. **Create directory:**

   ```bash
   mkdir -p modules/auth/my-auth-provider/files
   ```

2. **Create module.json:**

   ```json
   {
     "name": "auth",
     "displayName": "My Auth Provider",
     "description": "...",
     "category": "auth",
     "provider": "my-auth-provider",
     "supportedFrameworks": ["nextjs"],
     "dependencies": {
       "my-auth-lib": "^1.0.0"
     },
     "envVars": [
       {
         "key": "AUTH_SECRET",
         "value": "",
         "description": "Secret key",
         "required": true
       }
     ],
     "patches": [
       {
         "type": "create-file",
         "source": "lib/auth.ts",
         "destination": "{{lib}}/auth.ts"
       }
     ]
   }
   ```

3. **Add files:**

   ```bash
   # modules/auth/my-auth-provider/files/lib/auth.ts
   ```

4. **Test:**
   ```bash
   cd apps/create-stackkit
   npm run build
   npx . test-app
   # Select your module
   ```

### Add a New Database Module

Same steps, but:

- Put in `modules/database/`
- Set `"category": "database"`

### Update Existing Module

1. Edit `modules/{category}/{provider}/module.json`
2. Update files in `files/` directory
3. Test with both CLIs

### Debug Module Loading

Add console.logs in:

- `apps/create-stackkit/src/lib/create-project.ts`
- `apps/stackkit-cli/src/commands/add.ts`
- `shared/module-loader.ts`

## Placeholder System

Use these in `destination` paths:

```json
{
  "source": "lib/auth.ts",
  "destination": "{{lib}}/auth.ts"
}
```

Becomes:

- Next.js: `lib/auth.ts`
- Express: `src/auth.ts`
- React: `src/auth.ts`

Available placeholders:

- `{{lib}}` - lib or src
- `{{router}}` - app or src/routes
- `{{config}}` - root directory

## Testing Checklist

Before submitting PR:

- [ ] Module.json is valid
- [ ] All source files exist
- [ ] Tested with create-stackkit-app
- [ ] Tested with stackkit-cli
- [ ] Tested on Next.js (if applicable)
- [ ] Tested on Express (if applicable)
- [ ] TypeScript builds without errors
- [ ] Environment variables documented
- [ ] Dependencies use specific versions

## Common Issues

### "Module not found"

- Check module.json exists
- Verify directory structure: `modules/{category}/{provider}/`
- Run `npm run build` in CLI app

### "Source file not found"

- Check paths in module.json `patches`
- Files should be in `files/` subdirectory
- Paths are relative to `files/`

### "Placeholder not replaced"

- Use correct syntax: `{{lib}}` not `{lib}`
- Check available placeholders
- Framework might not support that placeholder

### Build fails

- Run `npm run clean` then `npm run build`
- Check TypeScript errors
- Ensure modules directory exists

## Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - System design
- [MODULE_GUIDE.md](MODULE_GUIDE.md) - Create modules
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guide
- [README.md](../README.md) - User-facing docs

## Getting Help

- 💬 [GitHub Discussions](https://github.com/tariqul420/stackkit/discussions)
- 🐛 [GitHub Issues](https://github.com/tariqul420/stackkit/issues)
- 📧 Email maintainers

## Tips

1. **Start simple** - Copy an existing module and modify it
2. **Test early** - Build and test after small changes
3. **Read existing code** - See how other modules work
4. **Use validation** - Run validation utility on your modules
5. **Ask questions** - Open a discussion if stuck

## Next Steps

1. Read [ARCHITECTURE.md](../ARCHITECTURE.md) for deep dive
2. Read [MODULE_GUIDE.md](MODULE_GUIDE.md) for module creation
3. Look at existing modules in `/modules`
4. Try creating a simple module
5. Open a PR!

Happy coding! 🚀
