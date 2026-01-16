# React + Vite Template

Production-ready React starter with TypeScript, Vite, and essential libraries.

## Quick Start

```bash
pnpm install
pnpm dev
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

Copy `.env.example` to `.env` and configure:

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

```bash
pnpm build
```

Deploy the `dist` folder to Vercel, Netlify, or any static hosting service.
