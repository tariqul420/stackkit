# StackKit Project

This project was created with [StackKit](https://github.com/yourusername/stackkit).

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment variables:

```bash
cp .env.example .env
```

3. Update the `DATABASE_URL` in `.env` with your PostgreSQL connection string.

4. Run database migrations:

```bash
pnpm prisma migrate dev --name init
```

5. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Robust relational database
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - TypeScript-first schema validation

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
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
