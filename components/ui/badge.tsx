import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "success" | "warning" | "brand" | "destructive";

const variants: Record<Variant, string> = {
  default: "bg-sky-50 text-sky-800 border border-sky-200 font-semibold",
  secondary: "bg-slate-100 text-slate-700 border border-slate-200",
  outline: "text-slate-800 border border-slate-300 bg-white",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold",
  warning: "bg-amber-50 text-amber-800 border border-amber-300 font-semibold",
  brand: "bg-cyan-50 text-cyan-800 border border-cyan-300 font-semibold",
  destructive: "bg-rose-50 text-rose-800 border border-rose-200 font-semibold",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
