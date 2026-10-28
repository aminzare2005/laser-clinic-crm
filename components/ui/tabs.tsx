"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Ctx = {
  value: string;
  setValue: (v: string) => void;
  variant: "segmented" | "underline";
  id: string;
};
const TabsCtx = React.createContext<Ctx | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  variant?: "segmented" | "underline";
  className?: string;
  children: React.ReactNode;
}

/** تب‌ها VibeFarsi */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  variant = "segmented",
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const id = React.useId();
  const v = value ?? internal;
  const setValue = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <TabsCtx.Provider value={{ value: v, setValue, variant, id }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({
  className,
  children,
  "aria-label": label,
}: {
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const ctx = React.useContext(TabsCtx)!;

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center gap-1.5 p-1 rounded-control bg-slate-100/90 border border-border/80",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsCtx)!;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.id}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.id}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-3.5 py-1.5 text-xs font-bold rounded-control transition-all cursor-pointer",
        active
          ? "bg-white text-primary shadow-xs border border-border"
          : "text-muted-foreground hover:text-foreground hover:bg-white/60",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsCtx)!;
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.id}-panel-${value}`}
      aria-labelledby={`${ctx.id}-tab-${value}`}
      className={cn("mt-3", className)}
    >
      {children}
    </div>
  );
}
