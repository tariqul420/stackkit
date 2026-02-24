# React Template

Production-ready React starter with TypeScript, Vite, and essential libraries.

## Requirements

- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm

## Quick Start

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

## Recommended Folder & File Structure

```text
react-vite-app/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── layouts/
│   │       ├── PublicLayout.tsx
│   │       └── DashboardLayout.tsx
│
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── SignupPage.tsx
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── products/
│   │   └── orders/
│
│   ├── shared/
│   │   ├── ui/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── api/
│   │   │   ├── http.ts                  # axios/fetch client
│   │   │   └── endpoints.ts
│   │   └── lib/
│   │       ├── env.ts
│   │       ├── utils.ts
│   │       └── auth-client.ts           # Auth client helper
│
│   ├── assets/
│   ├── main.tsx
│   └── index.css
│
├── public/
├── tests/
│   ├── unit/
│   └── e2e/
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
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
