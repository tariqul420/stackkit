# Project

Created with [StackKit](https://github.com/tariqul420/stackkit).

## Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Update DATABASE_URL in .env

# Run migrations
pnpm prisma migrate dev

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stack

- Next.js 15 (App Router)
- TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- shadcn/ui
- Zod validation

## Structure

```
├── app/              # Next.js routes
├── lib/              # Utilities
├── prisma/           # Database schema
└── public/           # Static files
```

## Scripts

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Start production
pnpm lint             # Run linter
pnpm prisma studio    # Open Prisma Studio
```

## Add Features

```bash
npx stackkit-cli add auth
```
├── lib/                 # Shared utilities
│   ├── db.ts           # Prisma client
│   └── env.ts          # Environment validation
├── prisma/             # Database schema
│   └── schema.prisma
└── public/             # Static assets
```

## Available Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Adding Features

Use StackKit to add more features to your project:

```bash
npx stackkit add auth
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [StackKit Documentation](https://github.com/yourusername/stackkit)
