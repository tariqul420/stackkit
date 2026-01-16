# Next.js Template

Production-ready Next.js starter with TypeScript and App Router.

## Quick Start

```bash
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

Create `.env.local` file for environment variables.

## Deployment

```bash
npm run build
npm run start
```

Deploy to Vercel, Netlify, or any Node.js hosting service.
