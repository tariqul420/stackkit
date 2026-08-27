# Agent Execution Protocol

> Mandatory operating rules for AI automation units (and human contributors) modifying this backend.
> Read `DESIGN.md` first — this file enforces the rules described there.

## 1. Hard Constraints

### 1.1 Controllers never touch the database
- Controllers parse `req`, call **one** service method, and reply via `sendResponse`.
- No database queries inside controllers. No business rules inside controllers. No validation inside controllers.
- Wrap async handlers in `catchAsync`; throw `AppError` for domain failures.

### 1.2 Zod validation on every mutating endpoint
- Every `POST`/`PATCH`/`PUT`/`DELETE` route **must** carry `validate(schema)` on the route line.
- Query params go through `validate(schema, "query")`; path params through `validate(schema, "params")`.
- Schemas live in the feature's `<feature>.schema.ts`; the service must only consume fields the schema declares.

### 1.3 Auth is Better Auth — never custom
- Never add password hashing, token signing, or session creation logic anywhere in `src/modules/**`.
- All authentication endpoints are served by Better Auth at `/api/auth/*`. Do not add competing routes (`/login`, `/register`, `/signin`, etc.).
- To change auth behavior (plugins, social providers, session length, hooks), edit `src/lib/auth/index.ts` only.
- `src/modules/profile/` may read `req.user` but must never read/write passwords, tokens, or sessions directly.

### 1.4 Response envelope only
- Success: `sendResponse(res, { status, success: true, message, data?, meta? })`.
- Failure: throw `AppError` (handled centrally) — do not hand-roll `res.status().json({...})`.

### 1.5 Keep the 4-file pattern
- Extend a feature by editing its four files (`index.ts` router, `*.controller.ts`, `*.service.ts`, `*.schema.ts`).
- Do not create parallel routing structures or ad-hoc service modules inside a feature.
- New feature → create the four files, then mount the router in `src/routes/index.ts`.

## 2. Endpoint Standards

| Requirement | Rule |
|---|---|
| Route method/path | Keep `/api/v1` prefix out of feature routers (the central mount adds it) |
| Guards | `authorize(Role.X)` at the route line where the endpoint requires auth |
| List endpoints | Paginate (`page`/`limit`), return `meta: { page, limit, total, totalPages }` |
| Naming | Route files `index.ts`; controllers `*.controller.ts`; services `*.service.ts`; schemas `*.schema.ts` |

## 3. Verification Pipeline (must pass before done)

```bash
pnpm build      # tsc — zero errors
pnpm lint       # eslint ./src/**/*
```

- When the database schema changes (Prisma), run `pnpm prisma:generate` before typechecking.

## 4. Scope Discipline

- One feature or fix per change; one logical commit.
- Do not weaken guards to make something pass — fix the query/route instead.
- Keep controllers thin; if a controller grows beyond ~60 lines, logic belongs in the service.
- Log anomalies via the centralized `logger` (never `console.log`).

## 5. Deliverable Checklist

- [ ] Route carries `validate()` on mutating endpoints
- [ ] Controller is thin (parse → service → `sendResponse`)
- [ ] Envelope contract used; no raw JSON responses in features
- [ ] No custom auth logic added anywhere — Better Auth remains the only auth provider
- [ ] `pnpm build` and `pnpm lint` green
