# Next.js Template

Production-ready Next.js starter with TypeScript and App Router.

## Requirements

- Node.js 18+ (LTS recommended)
- pnpm or npm

## Quick Start

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

## Recommended Folder & File Structure

```text
next-app/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── pricing/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   └── orders/page.tsx
│   │   ├── api/
│   │   │   ├── health/route.ts
│   │   │   └── auth/route.ts              # (optional) if you expose auth endpoints
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── products/
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── queries/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── orders/
│   │       ├── components/
│   │       ├── actions/
│   │       ├── queries/
│   │       ├── schemas/
│   │       ├── types/
│   │       └── index.ts
│   │
│   ├── components/
│   │   ├── ui/                            # shadcn/ui only
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── server/                            # server-only boundary
│   │   ├── auth/
│   │   │   ├── auth.ts                    # Auth (server config)
│   │   │   └── guards.ts
│   │   ├── db/
│   │   │   └── prisma.ts                  # PrismaClient singleton
│   │   ├── repositories/
│   │   │   ├── product.repo.ts
│   │   │   └── order.repo.ts
│   │   └── services/
│   │       ├── email.service.ts
│   │       └── storage.service.ts
│   │
│   ├── lib/
│   │   ├── env.ts
│   │   ├── utils.ts
│   │   ├── logger.ts
│   │   └── auth/
│   │       └── auth-client.ts             # Auth (client helper)
│   │
│   ├── hooks/
│   │   └── useDebounce.ts
│   │
│   └── types/
│       └── global.d.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
├── tests/
│   ├── unit/
│   └── e2e/
│
├── middleware.ts
├── next.config.js
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
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
