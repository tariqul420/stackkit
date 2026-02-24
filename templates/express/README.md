# Express Template

Production-ready Express (TypeScript) starter for building REST APIs and backend services.

## Requirements

- Node.js 18+ (LTS recommended)
- pnpm or npm

## Quick Start

Install dependencies and start the development server:

```bash
# using pnpm (recommended)
pnpm install
pnpm dev

# or using npm
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Start production server

## Environment

Use a `.env` file or environment variables for configuration. See `.env.example` for available keys.

## Recommended Folder & File Structure

```text
express-api/
├── src/
│   ├── app.ts
│   ├── server.ts
│
│   ├── config/
│   │   ├── env.ts
│   │   ├── cors.ts
│   │   ├── rateLimit.ts
│   │   └── logger.ts                    # (optional)
│
│   ├── database/
│   │   └── prisma.ts                     # PrismaClient singleton
│   
│   ├── lib/ 
│       └── auth.ts                   # Auth server config
│
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── authorize.middleware.ts        # reads session + attaches req.user
│   │   │   ├── error.middleware.ts
│   │   │   └── notFound.middleware.ts
│   │   ├── errors/
│   │   │   ├── ApiError.ts
│   │   │   └── errorCodes.ts
│   │   ├── utils/
│   │   │   ├── catchAsync.ts
│   │   │   ├── sendResponse.ts
│   │   │   └── pagination.ts
│   │   └── logger/
│   │       └── logger.ts
│
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.validator.ts
│   │   │   └── users.types.ts
│   │   └── products/
│   │       ├── products.routes.ts
│   │       ├── products.controller.ts
│   │       ├── products.service.ts
│   │       ├── products.repository.ts
│   │       ├── products.validator.ts
│   │       └── products.types.ts
│
│   ├── routes/
│   │   └── index.ts                      # mounts all module routes
│   │
│   └── types/
│       └── express.d.ts                  # Request typing (req.user)
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .env.example
└── README.md
```

---

## Generated with StackKit

This project was scaffolded using **StackKit** — a CLI toolkit for building production-ready applications.

- Generated via: `npx stackkit@latest create`

Learn more about StackKit:
https://github.com/tariqul420/stackkit
