"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Github, Package } from "lucide-react";

export default function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("npx stackkit create");
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
              <span>npx stackkit create</span>
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
                href="https://github.com/tariqul420/stackkit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.npmjs.com/package/stackkit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Package className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
