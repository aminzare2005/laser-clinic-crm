"use client";

import * as React from "react";
import { Check, IdCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNationalId, isNationalId, normalizeNationalId } from "@/lib/persian";

export interface NationalIdInputProps {
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidChange?: (digits: string, valid: boolean) => void;
  className?: string;
  id?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  required?: boolean;
}

/**
 * ورودی کد ملی VibeFarsi.
 * نمایش با الگوی چاپی کارت ملی ۳-۶-۱ و اعتبارسنجی الگوریتم چک‌سام ایرانی.
 */
export function NationalIdInput({
  value,
  defaultValue,
  name,
  onChange,
  onValidChange,
  className,
  id,
  autoFocus,
  disabled,
  required,
}: NationalIdInputProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const currentVal = value !== undefined ? value : internal;
  const digits = normalizeNationalId(currentVal);
  const complete = digits.length === 10;
  const valid = isNationalId(digits);
  const invalid = complete && !valid;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const norm = normalizeNationalId(raw);
    if (value === undefined) setInternal(norm);
    if (onChange) {
      e.target.value = norm;
      onChange(e);
    }
    onValidChange?.(norm, isNationalId(norm));
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-field border bg-field px-3 transition-colors focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary",
          invalid ? "border-rose-400 bg-rose-50/20" : valid ? "border-emerald-400 bg-emerald-50/20" : "border-slate-300",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50"
        )}
        dir="ltr"
      >
        <IdCard className="size-4.5 shrink-0 text-muted-foreground" />
        <input
          id={id}
          name={name}
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          value={formatNationalId(digits)}
          onChange={handleChange}
          placeholder="۰۰۱-۲۳۴۵۶۷-۸"
          maxLength={12}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-mono tracking-wider tabular-nums outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed"
          aria-invalid={invalid ? true : undefined}
          aria-describedby={id ? `${id}-hint` : undefined}
        />
        {valid && <Check className="size-4.5 shrink-0 text-emerald-600 font-bold" />}
      </div>
      <p id={id ? `${id}-hint` : undefined} className="text-[11px] font-medium" aria-live="polite">
        {valid ? (
          <span className="text-emerald-700">✓ ساختار کد ملی معتبر است</span>
        ) : invalid ? (
          <span className="text-rose-600">کد ملی نامعتبر است؛ ارقام را مجدداً بررسی فرمایید</span>
        ) : (
          <span className="text-muted-foreground">۱۰ رقم، مشابه فرمت مندرج روی کارت ملی</span>
        )}
      </p>
    </div>
  );
}
