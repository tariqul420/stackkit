# Agent Execution Protocol

> Mandatory operating rules for AI automation units (and human contributors) modifying this frontend.
> Read `DESIGN.md` first — this file enforces the rules described there.

## 1. Hard Constraints

### 1.1 `pages/` stays thin
- No direct `axios`/`fetch` calls, no business logic in `pages/**` files.
- Pages fetch/mutate through feature query hooks and render feature/shared components.

### 1.2 One HTTP client
- All requests go through `lib/axios/http.ts`. Never create a second axios instance or call `fetch` directly in a feature or component.

### 1.3 Component placement
- `components/ui` — shadcn primitives only, never feature-aware.
- `components/` (root) — cross-app reusable components with no feature dependency.
- Feature-specific components live in `features/<feature>/components/`, never in `components/`.

### 1.4 Auth is Better Auth — never custom
- If the auth module is installed, all sign-up/sign-in/session logic is handled by Better Auth's client (`lib/auth/auth-client.ts`). Do not hand-roll token storage or parallel session logic.

## 2. Verification Pipeline (must pass before done)

```bash
pnpm build      # tsc -b && vite build — zero errors
pnpm lint       # eslint .
```

## 3. Scope Discipline

- One feature or fix per change; one logical commit.
- Do not add a new HTTP client, state library, or UI kit without clear justification — reuse what's already wired.
- Keep pages/components small; extract shared logic into `lib/` or a feature's own helpers.

## 4. Deliverable Checklist

- [ ] No direct `axios`/`fetch` outside `lib/axios/http.ts`
- [ ] Components placed in the correct scope (`ui` / shared / feature)
- [ ] No custom auth logic added — Better Auth remains the only auth provider
- [ ] `pnpm build` and `pnpm lint` green
