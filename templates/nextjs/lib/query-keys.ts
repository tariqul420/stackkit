/**
 * Central registry of query key factories.
 *
 * Each feature under `features/<feature>/queries/` defines and exports its own
 * `<FEATURE>_QUERY_KEYS` factory. Re-export it here so other features/components
 * can discover and invalidate keys without importing deep into another feature.
 *
 * Example (added automatically when a feature module wires its query keys):
 *   export { AUTH_QUERY_KEYS } from "@/features/auth/queries/auth.queries";
 */
export {};
