"use client";

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

type BaseProps = {
  id?: string;
  icon?: LucideIcon;
  label?: React.ReactNode;
  placeholder?: string;
  description?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  textareaClassName?: string;
  rows?: number;
  minHeight?: string;
  maxLength?: number;
  showCount?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoResize?: boolean;
  trimOnBlur?: boolean;
  readOnly?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  defaultValue?: string;
  error?: React.ReactNode;
};

export type TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = BaseProps & { name?: TName };

const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps<FieldValues, string>
>((props, ref) => {
  const {
    name,
    id,
    icon: Icon,
    label,
    placeholder,
    description,
    className,
    wrapperClassName,
    textareaClassName,
    rows = 4,
    minHeight,
    maxLength,
    showCount = false,
    disabled = false,
    required = false,
    autoResize = false,
    trimOnBlur = false,
    readOnly = false,
    value: externalValue,
    onValueChange,
    onChange,
    onKeyUp,
    onPaste,
    onBlur,
    defaultValue,
    error,
  } = props;
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const setMergedRef = React.useCallback(
    (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          el;
    },
    [ref]
  );

  const autoId = React.useId();
  const textareaId = id ?? autoId;

  const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
  const standaloneValue = externalValue ?? internal;

  const resizeNow = React.useCallback(() => {
    if (!autoResize || !innerRef.current) return;
    const el = innerRef.current;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize]);

  React.useEffect(() => {
    resizeNow();
  }, [resizeNow]);

  if (!name) {
    const value = standaloneValue ?? "";

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      const next = e.target.value;
      void (onValueChange ? onValueChange(next) : setInternal(next));
      onChange?.(e);
      resizeNow();
    };

    const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
      if (trimOnBlur) {
        const trimmed = e.target.value.trim();
        if (trimmed !== e.target.value) {
          void (onValueChange ? onValueChange(trimmed) : setInternal(trimmed));
        }
      }
      onBlur?.(e);
    };

    const count = typeof value === "string" ? value.length : 0;

    return (
      <div className={className}>
        {label ? (
          <FieldLabel htmlFor={textareaId} className="mb-2 inline-flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </FieldLabel>
        ) : null}

        <div
          className={cn(
            "overflow-hidden rounded-md dark:bg-transparent",
            wrapperClassName
          )}
        >
          <Textarea
            ref={setMergedRef}
            id={textareaId}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyUp={onKeyUp}
            onPaste={onPaste}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            maxLength={maxLength}
            className={cn("w-full", minHeight, textareaClassName)}
            aria-required={required || undefined}
          />
        </div>

        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}

        {showCount && (
          <div
            className={cn(
              "mt-1 text-right text-xs",
              maxLength && count >= maxLength * 0.95
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {count}
            {maxLength ? ` / ${maxLength}` : ""}
          </div>
        )}

        {error ? (
          <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => {
        const value = externalValue ?? field.value ?? "";
        const count = typeof value === "string" ? value.length : 0;

        return (
          <Field className={className} data-invalid={fieldState.invalid}>
            {label ? (
              <FieldLabel className="mb-2 inline-flex items-center gap-2" htmlFor={textareaId}>
                {Icon && <Icon className="w-4 h-4" />}
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
              </FieldLabel>
            ) : null}

            <FieldContent>
              <div
                className={cn(
                  "overflow-hidden rounded-md bg-light dark:bg-transparent",
                  wrapperClassName
                )}
              >
                <Textarea
                  ref={setMergedRef}
                  id={textareaId}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onValueChange?.(e.target.value);
                    onChange?.(e);
                    resizeNow();
                  }}
                  onBlur={(e) => {
                    if (trimOnBlur) {
                      const trimmed = e.target.value.trim();
                      if (trimmed !== e.target.value) {
                        field.onChange(trimmed);
                        onValueChange?.(trimmed);
                      }
                    }
                    field.onBlur();
                    onBlur?.(e);
                  }}
                  onKeyUp={onKeyUp}
                  onPaste={onPaste}
                  disabled={disabled || field.disabled}
                  readOnly={readOnly}
                  rows={rows}
                  maxLength={maxLength}
                  className={cn("w-full", minHeight, textareaClassName)}
                  aria-required={required || undefined}
                />
              </div>
            </FieldContent>

            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}

            {showCount && (
              <div
                className={cn(
                  "mt-1 text-right text-xs",
                  maxLength && count >= maxLength * 0.95
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {count}
                {maxLength ? ` / ${maxLength}` : ""}
              </div>
            )}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
});

TextareaField.displayName = "TextareaField";
export default TextareaField;