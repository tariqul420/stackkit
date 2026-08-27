# Backend — Design & Architecture Guide

> Source of truth for this Express backend. Read before adding routes, features, or database access.

## Tech Stack

| Area | Technology |
|---|---|
| Runtime | Node.js (>=20) + `tsx` (dev/watch), `tsc` (build) |
| Web framework | Express 5 |
| Validation | Zod v4 via a `validate()` middleware |
| Auth | Better Auth (session-based) — the **only** supported auth provider |
| Logging | Centralized `logger` (`src/config/logger.ts`) |
| Security | `helmet`, `express-rate-limit`, `cors`, `cookie-parser` |

Optional, added by the modules you selected during `stackkit create`:

- **Database**: Prisma (PostgreSQL/MySQL/SQLite) or Mongoose (MongoDB)
- **Storage**: Cloudinary media uploads

## Architectural Doctrine: Feature-First

The backend is organized as a set of self-contained **feature modules** under `src/modules/<feature>/`. Each feature owns its HTTP surface, validation, and business logic. Nothing about a feature leaks into another; shared capabilities live in `src/shared/`.

The backend is **transport-first**: every feature folder exports an Express `Router`. Middleware composition (guards + validation) is declared inline at the router, so an endpoint's security posture is readable from a single file.

## Repository Layout

```
src/
├── server.ts               ← bootstrap (http server + graceful shutdown)
├── app.ts                  ← Express app assembly (middleware, routes, error handling)
├── routes/
│   └── index.ts            ← central router: mounts every feature under /api/v1
├── modules/
│   ├── health/              ← liveness/readiness endpoint
│   ├── profile/             ← authenticated user profile (get/update) — NOT auth itself
│   └── media/                ← (cloudinary module) signed uploads/transforms
├── lib/
│   └── auth/                ← Better Auth instance + auth-only infra (never a "feature")
│       ├── index.ts          ← betterAuth({...}) instance, mounted at /api/auth/* in app.ts
│       ├── auth.constants.ts ← Role/UserStatus enums (mongoose only; prisma uses @prisma/client)
│       └── auth.helper.ts    ← raw collection access for the mongoose adapter (mongoose only)
├── database/                ← Prisma client / Mongoose connection bootstrap
├── config/                  ← env schema, cors, logger, rate-limit
├── shared/
│   ├── errors/               ← AppError
│   ├── middlewares/           ← validate, authorize, error handler, not-found
│   └── utils/                 ← catchAsync, sendResponse, pagination
└── types/                   ← ambient Express request augmentation
```

## The 4-File Feature Pattern

Every feature folder is exactly four collaborating files (plus context-specific extras like models):

| File | Role | Responsibilities | MUST NOT |
|---|---|---|---|
| `index.ts` | **Router** | Declare Express routes, apply `authorize()` and `validate()` on the route line | Contain business logic or DB access |
| `<feature>.controller.ts` | **Controller** | Parse `req` (params/query/body), delegate to the service, translate to `sendResponse` | Touch the database, perform validation, hold business rules |
| `<feature>.service.ts` | **Service** | All business logic + database queries | Import Express; export HTTP concerns |
| `<feature>.schema.ts` | **Schema** | Zod schemas + inferred types (`I…` payload/query types) | Import Express or services |

**Flow of a request:**

```
express → routes/index.ts → feature router (index.ts: authorize + validate + route)
        → controller (parse + delegate)
        → service (business logic + DB query)
        → sendResponse (unified envelope)
```

## Auth Is Better Auth — No Custom Auth Code

- Sign-up, sign-in, sign-out, session, social login, email OTP, and password reset are handled **entirely** by Better Auth's own handler, mounted at `POST/GET /api/auth/*` in `app.ts` (`toNodeHandler(auth)`).
- `src/lib/auth/` only configures the Better Auth instance and (for Mongoose) exposes raw collection helpers the adapter needs — it never re-implements register/login/token logic.
- `src/modules/profile/` is a normal feature module (not auth) that reads `req.user` (populated by `authorize()` from the Better Auth session) to expose `/me` and update the current user's profile. It never touches passwords, tokens, or sessions.
- Do not add a `src/modules/auth/` feature or hand-roll JWT/session/password logic — extend `src/lib/auth/index.ts` (plugins, social providers, hooks) instead.

## Request Validation (Zod v4)

- Every mutating endpoint (`POST`/`PATCH`/`PUT`/`DELETE`) carries `validate(schema)` on the route line.
- Query/params validation: `validate(schema, "query")` / `validate(schema, "params")`.
- Schemas live in the feature's `<feature>.schema.ts`; controllers only consume fields the schema declares.

## API Response Envelope

- Success: `sendResponse(res, { status, success: true, message, data?, meta? })`.
- Failure: throw `AppError(status, message)` — handled centrally by `globalErrorHandler`. Never hand-roll `res.status().json({...})` inside a feature.

## Conventions

- Route files: `index.ts`. Controllers: `*.controller.ts`. Services: `*.service.ts`. Schemas: `*.schema.ts`.
- Log via the centralized `logger` (`src/config/logger.ts`), never `console.log`/`console.error`.
- Keep controllers thin; if one grows past ~60 lines, the extra logic belongs in the service.
