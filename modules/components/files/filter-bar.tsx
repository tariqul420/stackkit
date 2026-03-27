"use client";

import { useState } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface FilterBarProps {
  groups: FilterGroup[];
  onFilterChange: (filters: Record<string, string | string[]>) => void;
  className?: string;
}

export function FilterBar({ groups, onFilterChange, className }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});

  const handleChange = (key: string, value: string, multiple?: boolean) => {
    setActiveFilters((prev) => {
      let next: Record<string, string | string[]>;
      if (multiple) {
        const current = (prev[key] as string[]) || [];
        const exists = current.includes(value);
        next = {
          ...prev,
          [key]: exists ? current.filter((v) => v !== value) : [...current, value],
        };
      } else {
        next = { ...prev, [key]: prev[key] === value ? "" : value };
      }
      onFilterChange(next);
      return next;
    });
  };

  const clearAll = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  const hasActive = Object.values(activeFilters).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v,
  );

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      {groups.map((group) => (
        <div key={group.key} className="flex items-center gap-1">
          <span className="text-sm font-medium text-muted-foreground">{group.label}:</span>
          {group.options.map((option) => {
            const current = activeFilters[group.key];
            const isActive = group.multiple
              ? Array.isArray(current) && current.includes(option.value)
              : current === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(group.key, option.value, group.multiple)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ))}
      {hasActive && (
        <button
          type="button"
          onClick={clearAll}
          className="rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
