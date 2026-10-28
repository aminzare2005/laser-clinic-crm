"use client";

import * as React from "react";
import { Check, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIranMobile, isIranMobile, mobileOperator, normalizeIranMobile } from "@/lib/persian";

export interface PhoneInputProps {
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
 * ورودی شماره موبایل ایران VibeFarsi با تشخیص اپراتور و فرمت‌بندی ۳-۳-۴
 */
export function PhoneInput({
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
}: PhoneInputProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const currentVal = value !== undefined ? value : internal;
  const digits = normalizeIranMobile(currentVal);
  const complete = digits.length === 10;
  const valid = isIranMobile(digits);
  const invalid = complete && !valid;
  const op = mobileOperator(digits);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const norm = normalizeIranMobile(raw);
    if (value === undefined) setInternal(norm);
    if (onChange) {
      e.target.value = norm.length === 10 ? `0${norm}` : norm;
      onChange(e);
    }
    onValidChange?.(norm, isIranMobile(norm));
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
        <span className="text-xs font-mono font-bold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
          +۹۸
        </span>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          value={formatIranMobile(digits)}
          onChange={handleChange}
          placeholder="۹۱۲ ۳۴۵ ۶۷۸۹"
          maxLength={14}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-mono tracking-wider tabular-nums outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed"
          aria-invalid={invalid ? true : undefined}
        />
        {valid && <Check className="size-4.5 text-emerald-600 font-bold" />}
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">
        {op ? (
          <span className="text-primary font-semibold">اپراتور شناسایی‌شده: {op}</span>
        ) : invalid ? (
          <span className="text-rose-600">شماره موبایل باید با ۹ شروع شود و ۱۰ رقم باشد</span>
        ) : (
          "شماره همراه را با یا بدون صفر اولیه وارد نمایید"
        )}
      </p>
    </div>
  );
}
