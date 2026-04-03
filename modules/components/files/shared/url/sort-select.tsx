{{#if framework == "nextjs"}}
"use client";
{{/if}}

import * as React from "react";
{{#if framework == "nextjs"}}
import { useRouter, useSearchParams } from "next/navigation";
{{else}}
import { useNavigate, useSearchParams } from "react-router-dom";
{{/if}}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/utils/url-helpers";

export type SortOption = {
  value: string;
  label: string;
};

export interface SortSelectProps {
  items: SortOption[];
  paramKey?: string;
  placeholder?: string;
  defaultValue?: string;
  debounceMs?: number;
  replace?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
}

export default function SortSelect({
  items,
  paramKey = "sort",
  placeholder = "Default sorting",
  defaultValue = "",
  debounceMs = 350,
  replace = true,
  className = "w-full md:w-48",
  onValueChange,
  ariaLabel = "Sort options",
}: SortSelectProps) {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const searchParams = useSearchParams();
  {{else}}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  {{/if}}

  const [value, setValue] = React.useState(() => {
    return searchParams?.get(paramKey) ?? defaultValue;
  });

  React.useEffect(() => {
    const urlVal = searchParams?.get(paramKey) ?? defaultValue;
    setValue((prev) => (prev !== urlVal ? urlVal : prev));
  }, [searchParams, paramKey, defaultValue]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const qs = searchParams?.toString() ?? "";
      const newUrl = formUrlQuery({
        params: qs,
        key: paramKey,
        value: value && value !== defaultValue ? value : null,
      });

      {{#if framework == "nextjs"}}
      if (replace) router.replace(newUrl, { scroll: false });
      else router.push(newUrl, { scroll: false });
      {{else}}
      navigate(newUrl, { replace });
      {{/if}}

      onValueChange?.(value);
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
    onValueChange,
  ]);

  const handleChange = React.useCallback((v: string | null) => setValue(v ?? ""), []);

  return (
    <div className="overflow-hidden rounded-md dark:bg-transparent">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className={className} aria-label={ariaLabel}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
