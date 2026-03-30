"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Field,
    FieldContent,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Controller } from "react-hook-form";

export type MultiOption = { label: string; value: string };

type Props = {
  name: string;
  label?: string;
  options: MultiOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  renderCreate?: React.ReactNode;
  summaryFormatter?: (
    selected: string[],
    all: MultiOption[],
  ) => React.ReactNode;
  listMaxHeight?: number;
  showChips?: boolean;
};

export default function MultiSelectField({
  name,
  label,
  options,
  placeholder = "Select options",
  disabled = false,
  className,
  renderCreate,
  summaryFormatter,
  listMaxHeight = 260,
  showChips = true,
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => {
        const value: string[] = Array.isArray(field.value) ? field.value : [];

        const toggle = (v: string) => {
          const set = new Set(value);
          if (set.has(v)) {
            set.delete(v);
          } else {
            set.add(v);
          }
          field.onChange(Array.from(set));
        };

        const clearAll = () => field.onChange([]);
        const selectAll = () => field.onChange(options.map((o) => o.value));

        const allSelected =
          options.length > 0 && value.length === options.length;

        const defaultSummary = () => {
          if (!value.length)
            return <span className="text-muted-foreground">{placeholder}</span>;

          const labels = value
            .map((v) => options.find((o) => o.value === v)?.label || v)
            .filter(Boolean);

          if (!showChips) {
            return (
              <span>
                {labels.length > 2
                  ? `${labels.length} selected`
                  : labels.join(", ")}
              </span>
            );
          }
          return (
            <div className="flex gap-1">
              {labels.slice(0, 3).map((lab, i) => {
                const val = value[i];
                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="max-w-[100px] shrink-0 cursor-pointer px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      field.onChange(value.filter((v) => v !== val));
                    }}
                  >
                    <span className="block truncate" title={lab}>
                      {lab}
                    </span>
                  </Badge>
                );
              })}
              {labels.length > 3 && (
                <Badge variant="outline" className="shrink-0">
                  +{labels.length - 3}
                </Badge>
              )}
            </div>
          );
        };

        return (
          <Field className={clsx("space-y-2", className)} data-invalid={fieldState.invalid}>
            {label && <FieldLabel>{label}</FieldLabel>}
            <FieldContent>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="overflow-hidden" asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                  >
                    {summaryFormatter
                      ? summaryFormatter(value, options)
                      : defaultSummary()}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                {/* Use width override here since you can't change the Popover wrapper */}
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  {renderCreate ? (
                    <div className="border-b p-2">{renderCreate}</div>
                  ) : null}

                  <Command>
                    {/* MUST live inside <Command> */}
                    <div className="flex items-center gap-2 px-2 pt-2">
                      <CommandInput placeholder="Search..." />
                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={allSelected ? clearAll : selectAll}
                          disabled={!options.length}
                        >
                          {allSelected ? "Clear all" : "Select all"}
                        </Button>
                      </div>
                    </div>

                    <CommandList>
                      <CommandEmpty>No option found.</CommandEmpty>
                      <ScrollArea style={{ maxHeight: listMaxHeight }}>
                        <CommandGroup>
                          {options.map((opt) => {
                            const checked = value.includes(opt.value);
                            return (
                              <CommandItem
                                key={opt.value}
                                value={`${opt.label} ${opt.value}`}
                                className="cursor-pointer"
                                onSelect={() => toggle(opt.value)}
                              >
                                <Checkbox checked={checked} className="mr-2" />
                                <span className="flex-1">{opt.label}</span>
                                {checked && <Check className="h-4 w-4" />}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </ScrollArea>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FieldContent>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}