# React Template

Production-ready React starter with TypeScript, Vite, and essential libraries.

Requirements
------------

- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm

Quick Start
-----------

Install dependencies and run the dev server:

```bash
# using pnpm (recommended)
pnpm install
pnpm dev

# or using npm
npm install
npm run dev
```

## Features

- React 19 with TypeScript
- Vite for fast development
- React Router for routing
- TanStack Query for data fetching
- Tailwind CSS for styling
- ESLint for code quality

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run linter

## Environment Variables

Copy `.env.example` to `.env` and configure local values. Do not commit secrets.

Example:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=My App
```

## Project Structure

```
src/
├── api/          # API client
├── components/   # UI components
├── hooks/        # Custom hooks
├── lib/          # Utilities
├── pages/        # Route pages
├── types/        # TypeScript types
└── utils/        # Helper functions
```

## Deployment

Build for production and serve or deploy the static output:

```bash
# pnpm
pnpm build
pnpm preview

# npm
npm run build
npm run preview
```

Deploy the resulting `dist`/build output to your hosting platform (Vercel, Netlify, etc.).

---

## Generated with StackKit

This project was scaffolded using **StackKit** — a CLI toolkit for building production-ready applications.

- Generated via: `npx stackkit@latest create`

Learn more about StackKit:
https://github.com/tariqul420/stackkit

