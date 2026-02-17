# StackKit Documentation

Official documentation for StackKit, built with Fumadocs.

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Open browser
open http://localhost:3000
```

## Build

```bash
# Production build
pnpm build

# Preview production build
pnpm start
```

## Structure

```
app/
├── (home)/          # Landing page
├── docs/            # Documentation app
└── layout.tsx       # Root layout

content/docs/        # MDX documentation
├── index.mdx        # Docs home
├── getting-started/ # Quick start guides
├── cli/             # CLI command docs
├── concepts/        # Core concepts
├── modules/         # Module documentation
└── reference/       # Reference material
```

## Adding Content

1. Create `.mdx` file in `content/docs/`
2. Add frontmatter:
   ```mdx
   ---
   title: Page Title
   description: Page description
   ---
   ```
3. Update `meta.json` in parent folder for navigation

## Key Files

- `source.config.ts` - Fumadocs configuration
- `lib/source.ts` - Content source adapter
- `lib/layout.shared.tsx` - Shared layout components
- `app/layout.config.tsx` - Navigation config

## Components

Available components:

- Callout - Info and warning boxes
- Tabs - Tabbed content blocks
- Steps - Step-by-step guides
- Accordion - Collapsible sections

## Deployment

Docs are automatically deployed to Vercel on push to main.

## Links

- Live Site: https://stackkit.tariqul.dev
- Fumadocs: https://fumadocs.vercel.app
- Repository: https://github.com/tariqul420/stackkit
