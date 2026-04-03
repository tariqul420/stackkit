{{#if framework == "nextjs"}}
"use client";
{{/if}}

import * as React from "react";
{{#if framework == "nextjs"}}
import { useRouter, useSearchParams } from "next/navigation";
{{else}}
import { useNavigate, useSearchParams } from "react-router-dom";
{{/if}}
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils/url-helpers";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  paramKey?: string;
  defaultValue?: string;
  debounceMs?: number;
  replace?: boolean;
  minLength?: number;
  autoFocus?: boolean;
  showClear?: boolean;
  ariaLabel?: string;
  onDebouncedChange?: (value: string) => void;
};

export default function SearchBar({
  placeholder = "Search by title",
  className,
  inputClassName,
  paramKey = "search",
  defaultValue = "",
  debounceMs = 400,
  replace = true,
  minLength = 0,
  autoFocus = false,
  showClear = true,
  ariaLabel = "Search",
  onDebouncedChange,
}: SearchBarProps) {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const searchParams = useSearchParams();
  {{else}}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  {{/if}}

  const [value, setValue] = React.useState<string>(() => {
    return searchParams?.get(paramKey) ?? defaultValue;
  });

  React.useEffect(() => {
    const urlVal = searchParams?.get(paramKey) ?? defaultValue;
    setValue((prev) => (prev !== urlVal ? urlVal : prev));
  }, [searchParams, paramKey, defaultValue]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = value.trim();
      const meetsMin = trimmed.length >= minLength;
      const qs = searchParams?.toString() ?? "";

      const newUrl =
        meetsMin && trimmed !== defaultValue
          ? formUrlQuery({ params: qs, key: paramKey, value: trimmed })
          : removeKeysFromQuery({ params: qs, keysToRemove: [paramKey] });

      {{#if framework == "nextjs"}}
      if (replace) router.replace(newUrl, { scroll: false });
      else router.push(newUrl, { scroll: false });
      {{else}}
      navigate(newUrl, { replace });
      {{/if}}

      onDebouncedChange?.(trimmed);
    }, debounceMs);

    return () => clearTimeout(t);
  }, [
    value,
    debounceMs,
    replace,
    {{#if framework == "nextjs"}}
    router,
    {{else}}
    navigate,
    {{/if}}
    searchParams,
    paramKey,
    defaultValue,
    minLength,
    onDebouncedChange,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) setValue("");
  };

  return (
    <div className={cn("relative", className)}>
      <div className="border-input bg-background flex items-center gap-2 overflow-hidden rounded-md">
        <Input
          type="text"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={cn("pr-8", inputClassName, "bg-transparent")}
        />
      </div>

      {showClear && value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground absolute inset-y-0 right-2 my-auto flex h-6 w-6 items-center justify-center rounded-md focus:outline-none"
          aria-label="Clear search"
          title="Clear"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
