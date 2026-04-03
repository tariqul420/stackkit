{{#if framework == "nextjs"}}
"use client";
{{/if}}

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

const DEFAULT_OPTIONS = [10, 20, 50, 100];

interface PerPageSelectProps {
  options?: number[];
  paramKey?: string;
  defaultValue?: number;
  pageParamKey?: string;
  replace?: boolean;
  className?: string;
  onValueChange?: (value: number) => void;
}

export default function PerPageSelect({
  options = DEFAULT_OPTIONS,
  paramKey = "limit",
  defaultValue = 10,
  pageParamKey = "page",
  replace = true,
  className = "w-24",
  onValueChange,
}: PerPageSelectProps) {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const searchParams = useSearchParams();
  {{else}}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  {{/if}}

  const value = Number(searchParams?.get(paramKey) ?? defaultValue);

  const handleChange = (v: string) => {
    const num = Number(v);
    // Reset page to 1 whenever per-page changes
    const qs = new URLSearchParams(searchParams?.toString() ?? "");
    qs.delete(pageParamKey);
    const url = formUrlQuery({
      params: qs.toString(),
      key: paramKey,
      value: num === defaultValue ? null : String(num),
    });

    {{#if framework == "nextjs"}}
    if (replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
    {{else}}
    navigate(url, { replace });
    {{/if}}

    onValueChange?.(num);
  };

  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className={className} aria-label="Rows per page">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={String(opt)}>
            {opt} / page
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
