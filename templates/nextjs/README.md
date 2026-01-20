# Next.js Template

Production-ready Next.js starter with TypeScript and App Router.

Requirements
------------

- Node.js 18+ (LTS recommended)
- pnpm or npm

Quick Start
-----------

Install dependencies and start a development server:

```bash
# using pnpm (recommended)
pnpm install
pnpm dev

# or using npm
npm install
npm run dev
```

## Features

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

## Project Structure

```
app/
├── globals.css    # Global styles
├── layout.tsx     # Root layout
├── page.tsx       # Home page
└── api/           # API routes

lib/
└── utils.ts       # Utility functions

public/            # Static assets
```

## Environment Variables

Create a `.env.local` (Next.js) file for local environment variables. Keep secrets out of the repository.

## Deployment

```bash
npm run build
npm run start
```

Deploy to Vercel, Netlify, or any Node.js hosting service.

---

## Generated with StackKit

This project was scaffolded using **StackKit** — a CLI toolkit for building production-ready applications.

- Generated via: `npx stackkit@latest create`

Learn more about StackKit:
https://github.com/tariqul420/stackkit

