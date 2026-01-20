# StackKit Documentation

Documentation source for the StackKit website.

Quick Start
-----------

Install dependencies and run the docs site locally:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` to view the site.

Build
-----

```bash
pnpm build
pnpm start
```

Content
-------

Content lives under `content/docs/`. Add `.mdx` pages and update navigation via `meta.json`.

Key files
---------

- `source.config.ts` — Fumadocs config
- `lib/source.ts` — content adapter
- `lib/layout.shared.tsx` — layout helpers