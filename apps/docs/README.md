# StackKit Documentation

This is the official documentation site for [StackKit](https://github.com/tariqul420/stackkit), a production-ready project generator and modular CLI for building full-stack applications.

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the documentation.

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm start
```

### Content Structure

```
content/docs/
├── index.mdx              # Landing page
├── getting-started/       # Quick start guides
├── concepts/              # Core concepts
├── cli/                   # CLI reference
├── modules/               # Module documentation
├── reference/             # Technical reference
└── community/             # Community resources
```

### Adding Documentation

1. Create `.mdx` files in the appropriate `content/docs/` subdirectory
2. Update `meta.json` files to include new pages in navigation
3. Use Fumadocs components for enhanced content (tabs, callouts, etc.)

### Key Files

- `source.config.ts`: Fumadocs configuration
- `lib/source.ts`: Content source adapter
- `lib/layout.shared.tsx`: Shared layout options

## Deployment

The documentation is automatically deployed when changes are merged to the main branch.

## Contributing

See the [Contributing Guide](/docs/community/contributing) for information on improving the documentation.

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs
