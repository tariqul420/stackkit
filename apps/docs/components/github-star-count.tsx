"use client";

import { useEffect, useState } from "react";

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export function GithubStarCount({ count }: { count: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (count === 0) return;
    let current = 0;
    const duration = 1200;
    const steps = 40;
    const increment = count / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayed(count);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [count]);

  return <span className="tabular-nums transition-all">{formatCount(displayed)}</span>;
}
