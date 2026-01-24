import { isInternalRoute, isMinimalTrackingOnly } from "./analytics-config";

export type AnalyticsEvent =
  | "page_view"
  | "copy_code"
  | "outbound_click"
  | "docs_search"
  | "scroll_depth";

export interface PageViewParams {
  path: string;
  title?: string;
  referrer?: string;
  site_section?: string;
}

export interface CopyCodeParams {
  context?: string;
  language?: string;
  code_type?: "install_command" | "example";
  path: string;
}

export interface OutboundClickParams {
  destination: string;
  label: "github" | "npm" | "external";
  path: string;
}

export interface DocsSearchParams {
  query_length: number;
  has_results?: boolean;
  path: string;
}

export interface ScrollDepthParams {
  percent: number;
  path: string;
}

function canSendFromPath(path: string, allowDetailed = true) {
  if (isInternalRoute(path)) return false;
  if (!allowDetailed && isMinimalTrackingOnly(path)) return false;
  return true;
}

function pushToDataLayer(event: AnalyticsEvent, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  const isProd = process.env.NODE_ENV === "production";
  if (!gtm || !isProd) return;

  (window as any).dataLayer = (window as any).dataLayer || [];
  try {
    (window as any).dataLayer.push({ event, ...params });
  } catch (_) {}
}

export function track(event: "page_view", params: PageViewParams): void;
export function track(event: "copy_code", params: CopyCodeParams): void;
export function track(event: "outbound_click", params: OutboundClickParams): void;
export function track(event: "docs_search", params: DocsSearchParams): void;
export function track(event: "scroll_depth", params: ScrollDepthParams): void;
export function track(event: AnalyticsEvent, params: any) {
  if (typeof params?.path !== "string") return;
  const detailedAllowed = event === "page_view" ? true : false;
  if (!canSendFromPath(params.path, detailedAllowed)) return;

  pushToDataLayer(event, params);
}

export function trackCopy(payload: CopyCodeParams) {
  track("copy_code", payload);
}

export function trackOutboundClick(payload: OutboundClickParams) {
  track("outbound_click", payload);
}

export function trackSearch(payload: DocsSearchParams) {
  track("docs_search", payload);
}

export function trackScrollDepth(payload: ScrollDepthParams) {
  track("scroll_depth", payload);
}

// server-side enable check is available in `analytics-config` if needed
