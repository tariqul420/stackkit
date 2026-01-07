# Quick Start Guide

## For Users

### Create a New Project

```bash
# Interactive mode (recommended)
npx create-stackkit@latest

# With options
npx create-stackkit@latest my-app
```

This will:

1. Prompt you to choose a template
2. Select a package manager
3. Ask if you want to install dependencies
4. Ask if you want to initialize git

### Add Features to Existing Project

Navigate to your Next.js project and run:

```bash
npx stackkit-cli@latest add auth
```

This will:

1. Detect your project setup (App/Pages Router, TypeScript/JavaScript)
2. Install NextAuth.js
3. Create authentication routes
4. Add environment variables
5. Show next steps

### Available Commands

```bash
# List all templates and modules
npx stackkit-cli@latest list

# List only templates
npx stackkit-cli@latest list --templates

# List only modules
npx stackkit-cli@latest list --modules

# Preview changes without applying
npx stackkit-cli@latest add auth --dry-run

# Force overwrite existing files
npx stackkit-cli@latest add auth --force
```

## For Developers

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/stackkit.git
cd stackkit

# Install dependencies
pnpm install

# Build
pnpm build

# Link for local testing
cd apps/stackkit-cli
pnpm link --global

# Now use it
stackkit init my-app
```

### Development Workflow

```bash
# Watch mode for automatic rebuilds
cd apps/stackkit-cli
pnpm dev

# In another terminal, test your changes
stackkit init test-app
stackkit list
stackkit add auth
```

### Project Structure

```
stackkit/
├── apps/
│   ├── stackkit-cli/       # Main CLI (publish as stackkit-cli)
│   └── create-stackkit/    # Wrapper (publish as create-stackkit)
├── templates/              # Project templates
│   └── next-prisma-postgres-shadcn/
├── modules/                # Feature modules
│   └── auth/nextauth/
├── README.md               # Main documentation
├── CONTRIBUTING.md         # Contribution guide
├── DEVELOPMENT.md          # Development guide
└── LICENSE                 # MIT License
```

### Adding a New Template

1. Create directory: `templates/my-template/`
2. Add `template.json` with metadata
3. Add your project files
4. Test: `stackkit init test --template my-template`

### Adding a New Module

1. Create directory: `modules/category/module-name/`
2. Add `module.json` with metadata
3. Add files in `files/` directory
4. Test: `stackkit add module-name --dry-run`

## Common Use Cases

### Use Case 1: Start a New SaaS

```bash
npx create-stackkit@latest my-saas
cd my-saas
pnpm install
npx stackkit add auth
# Set up NEXTAUTH_SECRET and NEXTAUTH_URL in .env
pnpm dev
```

### Use Case 2: Add Auth to Existing Project

```bash
cd my-existing-project
npx stackkit-cli@latest add auth --dry-run  # Preview
npx stackkit-cli@latest add auth             # Apply
```

### Use Case 3: Explore Available Options

```bash
npx stackkit-cli@latest list
npx stackkit-cli@latest list --modules
```

## Tips & Tricks

### Dry Run First

Always use `--dry-run` to see what will change:

```bash
stackkit add auth --dry-run
```

### Use --force Carefully

The `--force` flag will overwrite existing files:

```bash
stackkit add auth --force
```

### Skip Installation for Speed

When testing, skip dependency installation:

```bash
stackkit init my-app --no-install
stackkit add auth --no-install
```

### Choose Your Package Manager

```bash
stackkit init my-app --pm pnpm
stackkit init my-app --pm yarn
stackkit init my-app --pm npm
```

### Automate with --yes

Skip all prompts:

```bash
stackkit init my-app --yes
```

## Troubleshooting

### Problem: Command not found

**Solution:** Install globally or use npx:

```bash
npm install -g stackkit-cli
# or
npx stackkit-cli@latest init my-app
```

### Problem: Module not found

**Solution:** Make sure you're in a Next.js project:

```bash
cd your-nextjs-project
stackkit add auth
```

### Problem: Files already exist

**Solution:** Use `--force` or `--dry-run`:

```bash
stackkit add auth --force
```

### Problem: Wrong router detected

**Solution:** Make sure you have either `app/` or `pages/` directory

## Next Steps

- ⭐ Star on [GitHub](https://github.com/yourusername/stackkit)
- 📖 Read [Full Documentation](https://github.com/yourusername/stackkit#readme)
- 💬 Join [Discussions](https://github.com/yourusername/stackkit/discussions)
- 🐛 Report [Issues](https://github.com/yourusername/stackkit/issues)
- 🤝 [Contribute](CONTRIBUTING.md)
