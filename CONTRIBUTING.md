# Contributing to StackKit

Thanks for your interest! 

## Development Setup

```bash
git clone https://github.com/tariqul420/stackkit.git
cd stackkit
pnpm install
pnpm build
```

## Project Structure

```
stackkit/
├── apps/
│   ├── stackkit-cli/        # CLI package
│   └── create-stackkit/     # NPX wrapper
└── templates/
    ├── bases/               # Framework base templates
    ├── databases/           # Database modules
    └── auth/                # Auth modules
```

## Modular Template System

Templates are composed of 3 parts:
1. **Base** - Framework (Next.js, Express, etc.)
2. **Database** - Prisma, Mongoose, etc.
3. **Auth** - NextAuth, Better Auth, etc.

### Adding a Base Template

```bash
templates/bases/framework-base/
├── template.json      # Metadata
├── package.json       # Dependencies
├── tsconfig.json
└── app/ or src/       # Source files
```

**template.json:**
```json
{
  "name": "framework-base",
  "displayName": "Framework Name",
  "framework": "framework"
}
```

### Adding a Database Module

```bash
templates/databases/db-name/
├── config.json        # Dependencies, env, scripts
├── prisma/
│   └── schema.prisma
└── lib/
    └── db.ts
```

**config.json:**
```json
{
  "name": "db-name",
  "compatibleWith": ["framework1", "framework2"],
  "dependencies": {},
  "devDependencies": {},
  "scripts": {},
  "env": {}
}
```

### Adding an Auth Module

```bash
templates/auth/auth-name/
├── config.json
├── lib/
│   └── auth.ts
└── app/ or src/       # Routes
```

**compatibleWith:**
```json
{
  "compatibleWith": {
    "frameworks": ["nextjs"],
    "databases": ["prisma-postgresql"]
  }
}
```

## Testing Changes

```bash
cd apps/create-stackkit
pnpm build && cp -r ../../templates .
node dist/index.js test-project

cd test-project
pnpm install
pnpm dev
```

## Guidelines

- ✅ Use TypeScript (JavaScript auto-converts)
- ✅ Keep templates minimal
- ✅ Test all combinations
- ✅ Document env variables
- ✅ Follow existing patterns

## Publishing

Only maintainers can publish:

```bash
# Bump version in package.json files
cd apps/stackkit-cli && npm publish
cd apps/create-stackkit && npm publish
```

## License

MIT
```json
{
  "name": "template-name",
  "description": "Template description",
  "features": ["feature1", "feature2"]
}
```
3. Add template files
4. Test with `stackkit init my-app --template template-name`

## Adding Modules

1. Create folder in `modules/category/module-name/`
2. Add `module.json`:
```json
{
  "name": "module-name",
  "displayName": "Module Display Name",
  "description": "Module description",
  "category": "category",
  "supports": ["nextjs"],
  "dependencies": {},
  "envVariables": []
}
```
3. Add module files in `files/` directory
4. Test with `stackkit add module-name --dry-run`

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit PR with clear description

## Code Style

- TypeScript for all code
- ESLint + Prettier for formatting
- Descriptive commit messages
- Add tests for new features

## Questions?

Open an issue or discussion on GitHub.
│   │   │   ├── utils/         # Utilities (detect, files, etc.)
│   │   │   └── types/         # TypeScript types
│   │   └── package.json
│   └── create-stackkit/       # NPX wrapper
├── templates/                  # Project templates
│   └── next-prisma-postgres-shadcn/
│       ├── template.json      # Template metadata
│       └── ...                # Template files
├── modules/                    # Feature modules
│   └── auth/
│       └── nextauth/
│           ├── module.json    # Module metadata
│           └── files/         # Module files to copy
└── package.json               # Root package with workspace scripts
```

## 🔧 Development Workflow

### Running the CLI in Development

```bash
# Watch mode for automatic rebuilds
cd apps/stackkit-cli
pnpm dev
```

In another terminal, test your changes:

```bash
stackkit init test-app
stackkit add auth
stackkit list
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format
```

## 📝 Adding New Features

### Adding a New Template

1. Create a new directory in `templates/`:

```bash
mkdir templates/my-template
```

2. Add a `template.json` metadata file:

```json
{
  "name": "my-template",
  "displayName": "My Template",
  "description": "Description of the template",
  "tags": ["tag1", "tag2"],
  "defaultPackageManager": "pnpm",
  "features": ["Feature 1", "Feature 2"]
}
```

3. Add your template files (package.json, tsconfig.json, etc.)

4. Test it:

```bash
stackkit init test-project --template my-template
```

### Adding a New Module

1. Create a new directory in `modules/<category>/<module-name>`:

```bash
mkdir -p modules/payments/stripe
```

2. Add a `module.json` metadata file:

```json
{
  "name": "stripe",
  "displayName": "Stripe Payments",
  "description": "Add Stripe payment integration",
  "category": "payments",
  "supportedFrameworks": ["nextjs"],
  "dependencies": {
    "stripe": "^14.0.0"
  },
  "envVars": [
    {
      "key": "STRIPE_SECRET_KEY",
      "value": "",
      "description": "Your Stripe secret key",
      "required": true
    }
  ],
  "patches": [
    {
      "type": "create-file",
      "description": "Create Stripe configuration",
      "source": "lib/stripe.ts",
      "destination": "{{lib}}/stripe.ts"
    }
  ]
}
```

3. Create the `files/` directory with files to copy

4. Test it:

```bash
stackkit add stripe --dry-run
```

### Adding a New CLI Command

1. Create a new file in `apps/stackkit-cli/src/commands/`:

```typescript
// apps/stackkit-cli/src/commands/my-command.ts
export async function myCommand(options: MyOptions): Promise<void> {
  // Implementation
}
```

2. Register it in `apps/stackkit-cli/src/index.ts`:

```typescript
import { myCommand } from './commands/my-command';

program.command('my-command').description('Description').action(myCommand);
```

3. Build and test:

```bash
pnpm build
stackkit my-command
```

## 🧪 Testing

### Manual Testing

1. Create a test directory outside the project
2. Test the CLI commands thoroughly
3. Verify generated projects build and run
4. Check for TypeScript errors
5. Test with different options and flags

### Test Checklist

- [ ] `stackkit init` creates valid projects
- [ ] Projects install dependencies correctly
- [ ] Projects build without errors
- [ ] `stackkit add` integrates modules properly
- [ ] Modules don't duplicate code
- [ ] Environment variables are added correctly
- [ ] Both App Router and Pages Router work
- [ ] TypeScript and JavaScript projects work
- [ ] Works with npm, yarn, and pnpm

## 📋 Pull Request Guidelines

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Make your changes** with clear, atomic commits
4. **Write descriptive commit messages**:
   - feat: Add new feature
   - fix: Fix bug
   - docs: Update documentation
   - refactor: Refactor code
   - test: Add tests
5. **Test thoroughly** using the checklist above
6. **Update documentation** if needed
7. **Push** to your fork
8. **Open a Pull Request** with:
   - Clear title and description
   - Screenshots/demos if applicable
   - Link to related issues

## 📜 Code Style

- Use TypeScript for all CLI code
- Follow the existing code structure
- Use meaningful variable and function names
- Add comments for complex logic
- Use async/await instead of promises
- Handle errors gracefully with user-friendly messages

## 🐛 Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (Node version, OS, etc.)
   - Screenshots if applicable

## 💡 Feature Requests

1. Check if the feature has been requested
2. Create a new issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions considered
   - Any additional context

## 🎯 Good First Issues

Look for issues labeled `good first issue` - these are great for new contributors!

## 📞 Getting Help

- 💬 [GitHub Discussions](https://github.com/yourusername/stackkit/discussions)
- 🐛 [GitHub Issues](https://github.com/yourusername/stackkit/issues)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to StackKit! 🙏
