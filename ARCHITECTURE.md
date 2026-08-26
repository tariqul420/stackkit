# StackKit Architecture Standard

This repository follows a **role/group/feature-first** organization so contributors can scale the codebase safely.

## Repository roles

- `apps/stackkit` → runtime CLI product
- `apps/docs` → documentation product
- `modules/*` → reusable feature modules grouped by category/provider
- `templates/*` → framework templates used by generators

## Group and feature structure

Inside product code (`apps/*/src`), structure should follow:

1. **Group** (domain area): `cli`, `generation`, `framework`, `project`, `env`, `ui`
2. **Feature** (single behavior): each file should solve one bounded concern in its group
3. **Shared utilities**: place only cross-group helpers in `utils`

## Production-readiness rules

- Keep public CLI behavior in `src/cli/*` and avoid leaking implementation details across groups
- Keep module metadata in `module.json` and generation behavior in `generator.json`
- Keep framework-specific files isolated under `templates/<framework>` and `modules/<category>/<provider>/files`
- Add tests for non-trivial logic in `apps/stackkit/src/lib/__tests__`
- Maintain strict TypeScript and lint-clean changes before merging

## Change checklist for contributors

- Preserve group boundaries (no feature sprawl into unrelated folders)
- Prefer adding new features as modules/templates instead of hardcoding in CLI flow
- Update docs when adding or changing module capabilities
- Run `pnpm ci:verify` before opening a pull request
