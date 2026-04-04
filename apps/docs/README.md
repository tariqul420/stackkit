# StackKit Docs

Official documentation for StackKit, built with [Fumadocs](https://fumadocs.vercel.app) and Next.js.

**Live site:** [stackkit.tariqul.dev](https://stackkit.tariqul.dev)

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```

## Structure

```
app/
├── (home)/          # Landing page
├── docs/            # Docs layout and pages
└── layout.tsx       # Root layout

content/docs/        # MDX content files
├── index.mdx
├── getting-started/
├── cli/
├── concepts/
├── modules/
├── reference/
└── community/

components/          # Shared UI components
lib/                 # Source config and shared helpers
public/              # Static assets (logos, images)
```

## Adding content

1. Create an `.mdx` file inside `content/docs/`
2. Add frontmatter:
   ```mdx
   ---
   title: Page Title
   description: Page description
   ---
   ```
3. Update `meta.json` in the parent folder for navigation ordering

## Key files

| File                          | Purpose                        |
| ----------------------------- | ------------------------------ |
| `source.config.ts`            | Fumadocs content configuration |
| `lib/source.ts`               | Content source adapter         |
| `lib/layout.shared.tsx`       | Shared nav and layout options  |
| `components/copy-command.tsx` | Terminal widget on homepage    |
| `components/footer.tsx`       | Site footer                    |

## Deployment

Docs deploy automatically to Vercel on push to `main`.

## Links

- [Live site](https://stackkit.tariqul.dev)
- [Fumadocs](https://fumadocs.vercel.app)
- [GitHub repository](https://github.com/tariqul420/stackkit)
