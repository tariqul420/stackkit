"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { track, trackOutboundClick, trackScrollDepth } from "../lib/analytics";
import { isInternalRoute, isMinimalTrackingOnly } from "../lib/analytics-config";

type Props = {
  enabled: boolean;
  gtmId?: string;
  children: React.ReactNode;
};

const THRESHOLDS = [25, 50, 75, 90];

export default function AnalyticsProvider({ enabled, children }: Props) {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const fired = useRef<Record<number, boolean>>({});
  const rafRef = useRef<number | null>(null);

  // Page view on route change (skip internal routes)
  useEffect(() => {
    if (!enabled) return;
    const path = pathname ?? "/";
    if (isInternalRoute(path)) return;
    if (prevPath.current === path) return;
    prevPath.current = path;
    track("page_view", {
      path,
      title: document.title || undefined,
      referrer: document.referrer || undefined,
      site_section: "docs",
    });
    fired.current = {};
  }, [pathname, enabled]);

  // Scroll depth (only on non-minimal pages)
  useEffect(() => {
    if (!enabled) return;
    const path = pathname ?? "/";
    if (isInternalRoute(path) || isMinimalTrackingOnly(path)) return;

    function computeAndFire() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight || document.body.scrollHeight;
      const clientHeight = doc.clientHeight || window.innerHeight;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      const percent = Math.min(100, Math.round((scrollTop / maxScroll) * 100));

      for (const threshold of THRESHOLDS) {
        if (!fired.current[threshold] && percent >= threshold) {
          fired.current[threshold] = true;
          trackScrollDepth({ percent: threshold, path: window.location.pathname });
        }
      }
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      rafRef.current = window.requestAnimationFrame(() => {
        computeAndFire();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    computeAndFire();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, pathname]);

  // Outbound click tracking (skip minimal/internal pages)
  useEffect(() => {
    if (!enabled) return;
    const path = pathname ?? "/";
    if (isInternalRoute(path) || isMinimalTrackingOnly(path)) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !anchor.href) return;
      if (anchor.getAttribute("data-analytics") === "off") return;

      try {
        const url = new URL(anchor.href, window.location.href);
        if (
          url.hostname &&
          url.hostname !== window.location.hostname &&
          url.protocol.startsWith("http")
        ) {
          const label = url.hostname.includes("github.com")
            ? "github"
            : url.hostname.includes("npmjs.com")
              ? "npm"
              : "external";
          trackOutboundClick({ destination: url.href, label, path: window.location.pathname });
        }
      } catch (_) {}
    }

    window.addEventListener("click", onClick, { capture: true });
    return () => window.removeEventListener("click", onClick, { capture: true });
  }, [enabled, pathname]);

  return <>{children}</>;
}
