import React from "react";
import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import { cn, faPercent } from "@/lib/utils";

export interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  delta?: number;
  deltaLabel?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

/** آمار و شاخص‌های داشبورد VibeFarsi */
export function Stat({
  label,
  value,
  unit,
  icon: Icon,
  delta,
  deltaLabel = "نسبت به روز قبل",
  size = "md",
  className,
}: StatProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-surface border border-border bg-card shadow-xs transition-shadow hover:shadow-sm",
        size === "sm" ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className="size-8 rounded-control bg-accent/70 flex items-center justify-center text-primary">
            <Icon className="size-4.5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className={cn("min-w-0 font-bold leading-tight", size === "sm" ? "text-xl" : "text-2xl")}>
          <span className="tabular-nums text-foreground">{value}</span>
          {unit && <span className="ms-1.5 inline-block text-xs font-semibold text-muted-foreground">{unit}</span>}
        </div>

        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
              up ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
            )}
            title={String(deltaLabel)}
          >
            {up ? <ArrowUpLeft className="size-3.5" /> : <ArrowDownLeft className="size-3.5" />}
            {faPercent(Math.abs(delta))}
          </span>
        )}
      </div>
    </div>
  );
}
