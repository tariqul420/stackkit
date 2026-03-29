"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ModeToggle } from "../mode-toggle";
import { Badge } from "../ui/badge";

export default function DashboardHeader({ role }: { role: "USER" | "ADMIN" | undefined }) {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true,
  );
  const pulse = true;
  const subtle = true;

  // Online/Offline
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <header className="border-border bg-card/80 supports-backdrop-filter:bg-card/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3">
        {/* Left */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="cursor-pointer" />

          {/* Divider */}
          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* System Status */}
          {role === "ADMIN" && (
            <Badge
              variant="secondary"
              aria-live="polite"
              aria-atomic="true"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-inset",
                subtle
                  ? isOnline
                    ? "bg-primary/15 text-primary ring-primary/30"
                    : "bg-destructive/15 text-destructive ring-destructive/30"
                  : isOnline
                    ? "bg-primary/10 text-primary ring-primary/25"
                    : "bg-destructive/10 text-destructive ring-destructive/25",
                "transition-colors",
              )}
              title={`System ${isOnline ? "Online" : "Offline"}`}
            >
              {/* Dot + optional ping */}
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                {pulse && (
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70",
                      isOnline ? "bg-primary" : "bg-destructive",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2.5 w-2.5 rounded-full",
                    isOnline ? "bg-primary" : "bg-destructive",
                  )}
                />
              </span>

              {/* Text */}
              <span className="tracking-wide">
                System{" "}
                <span className="font-bold">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </span>
            </Badge>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}