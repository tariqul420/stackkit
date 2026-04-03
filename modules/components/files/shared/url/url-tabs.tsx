{{#if framework == "nextjs"}}
"use client";
{{/if}}

import * as React from "react";
{{#if framework == "nextjs"}}
import { useRouter, useSearchParams } from "next/navigation";
{{else}}
import { useNavigate, useSearchParams } from "react-router";
{{/if}}
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formUrlQuery } from "@/lib/utils/url-helpers";

export type TabItem = {
  value: string;
  label: string;
};

interface UrlTabsProps {
  items: TabItem[];
  paramKey?: string;
  defaultValue?: string;
  className?: string;
  replace?: boolean;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export default function UrlTabs({
  items,
  paramKey = "tab",
  defaultValue,
  className,
  replace = true,
  onValueChange,
  children,
}: UrlTabsProps) {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const searchParams = useSearchParams();
  {{else}}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  {{/if}}

  const activeTab = searchParams?.get(paramKey) ?? defaultValue ?? items[0]?.value ?? "";

  const handleChange = (value: string) => {
    const url = formUrlQuery({
      params: searchParams?.toString() ?? "",
      key: paramKey,
      value: value === (defaultValue ?? items[0]?.value) ? null : value,
    });

    {{#if framework == "nextjs"}}
    if (replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
    {{else}}
    navigate(url, { replace });
    {{/if}}

    onValueChange?.(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleChange} className={className}>
      <TabsList>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
