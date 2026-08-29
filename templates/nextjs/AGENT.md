# Agent Execution Protocol

> Mandatory operating rules for AI automation units (and human contributors) modifying this frontend.
> Read `DESIGN.md` first — this file enforces the rules described there.

## 1. Hard Constraints

### 1.1 `app/` stays thin
- No direct `ofetch`/`fetch` calls, no business logic in `app/**` files.
- Pages fetch/mutate through feature query hooks and render feature/global components.

### 1.2 One HTTP client
- All requests go through `lib/ofetch/http.ts`. Never create a second HTTP client instance or call `fetch`/`ofetch` directly in a feature or component.

### 1.3 Component placement
- `components/ui` — shadcn primitives only, never feature-aware.
- `components/global` — cross-app reusable components with no feature dependency.
- Feature-specific components live in `features/<feature>/components/`, never in `components/`.

### 1.4 Client/server boundary
- Any file using React hooks (`useState`, `useQuery`, etc.) must start with `"use client"`.
- Treat `searchParams`/`params` as a `Promise` on every page component; `await` before use.

### 1.5 Auth is Better Auth — never custom
- If the auth module is installed, all sign-up/sign-in/session logic is handled by Better Auth's client (`lib/auth/auth-client.ts`). Do not hand-roll token storage, custom login forms that bypass it, or parallel session logic.

## 2. Verification Pipeline (must pass before done)

```bash
pnpm build      # next build — zero errors
pnpm lint       # eslint
```

## 3. Scope Discipline

- One feature or fix per change; one logical commit.
- Do not add a new HTTP client, state library, or UI kit without clear justification — reuse what's already wired.
- Keep pages/components small; extract shared logic into `lib/` or a feature's own helpers, not into `app/`.

## 4. Deliverable Checklist

- [ ] No direct `ofetch`/`fetch` outside `lib/ofetch/http.ts`
- [ ] Components placed in the correct scope (`ui` / `global` / feature)
- [ ] Client components correctly marked with `"use client"`
- [ ] No custom auth logic added — Better Auth remains the only auth provider
- [ ] `pnpm build` and `pnpm lint` green
