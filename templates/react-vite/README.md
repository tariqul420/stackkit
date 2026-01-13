# React + Vite Template

A production-ready React starter template with TypeScript, Vite, and essential libraries pre-configured.

## Features

- **React 19** with TypeScript
- **Vite 7** for fast development
- **React Router v7** for client-side routing
- **TanStack Query v5** for data fetching and caching
- **Axios** with interceptors
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **SEO Ready** with React Helmet Async
- **Error Boundaries** for graceful error handling
- **ESLint** for code quality
- **Prettier** for code formatting
- **Custom Hooks** included

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## Project Structure

```
src/
├── api/          # API client & interceptors
├── components/   # Reusable UI components
├── config/       # App configuration
├── hooks/        # Custom React hooks
├── lib/          # Library configurations
├── pages/        # Route pages
├── types/        # TypeScript types
├── utils/        # Helper functions
├── test/         # Test setup
├── App.tsx       # Main app component
├── main.tsx      # Entry point
└── index.css     # Global styles
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=My App
```

## Production Build

- Code splitting with vendor chunks
- Tree shaking to remove unused code
- Minified and compressed output
- TypeScript strict mode enabled
- ESLint configured for code quality

## Deployment

```bash
pnpm build
```

Deploy the `dist` folder to Vercel, Netlify, or any static hosting service.

## Tech Stack

- React 19 - UI library
- Vite 7 - Build tool
- TypeScript - Type safety
- React Router v7 - Routing
- TanStack Query v5 - Data fetching
- Axios - HTTP client
- Tailwind CSS - Styling
