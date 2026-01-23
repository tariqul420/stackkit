export const IGNORED_ROUTE_PREFIXES = ["/api", "/admin"];
export const MINIMAL_TRACK_ONLY_PAGES = ["/privacy", "/terms"];

export function isAnalyticsEnabledOnServer(): boolean {
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  const isProd = process.env.NODE_ENV === "production";
  return Boolean(gtm) && isProd;
}

export function isInternalRoute(path: string) {
  return IGNORED_ROUTE_PREFIXES.some((p) => path.startsWith(p));
}

export function isMinimalTrackingOnly(path: string) {
  return MINIMAL_TRACK_ONLY_PAGES.includes(path);
}
