"use client";

import { cn } from "@/lib/cn";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("fill-current", className)}
    >
      <title>npm</title>
      <path d="M20,4H4V20h8V8h4V20h4V4" />
    </svg>
  );
}

export default function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("npx stackkit@latest create");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-16 w-full max-w-3xl">
      <div className="relative overflow-hidden rounded-xl border border-fd-border bg-fd-card/80 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/50 px-5 py-3">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-500" />
            <div className="size-3 rounded-full bg-yellow-500" />
            <div className="size-3 rounded-full bg-green-500" />
          </div>
          <div className="ml-2 text-xs font-medium text-fd-muted-foreground">terminal</div>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-4 font-mono text-lg">
            <span className="text-fd-primary">$</span>
            <span
              className={`font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
                copied ? "text-green-500" : ""
              }`}
              onClick={handleCopy}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <span>npx stackkit@latest create</span>
              {(hovered || copied) && (
                <span className="ml-2">
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-fd-muted-foreground" />
                  )}
                </span>
              )}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <a
                href="https://www.npmjs.com/package/stackkit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <NpmIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
