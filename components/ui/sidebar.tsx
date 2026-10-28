"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn, fa } from "@/lib/utils";

export interface SidebarItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  href?: string;
  active?: boolean;
  badge?: number | string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function SidebarItem({ icon: Icon, label, href = "#", active, badge, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between rounded-control px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
          : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="truncate">{label}</span>
      </span>
      {badge !== undefined && (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold leading-none",
            active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
          )}
        >
          {typeof badge === "number" ? fa(badge) : badge}
        </span>
      )}
    </Link>
  );
}

export function SidebarGroup({
  title,
  collapsible,
  defaultOpen = true,
  children,
}: {
  title?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="space-y-1">
      {title && (
        <button
          type="button"
          onClick={() => collapsible && setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center justify-between px-2.5 pb-1 pt-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider",
            collapsible && "cursor-pointer hover:text-foreground"
          )}
        >
          <span>{title}</span>
          {collapsible && <ChevronDown className={cn("size-3 transition-transform", !open && "rotate-90")} />}
        </button>
      )}
      {open && children}
    </div>
  );
}

/** نوار کناری VibeFarsi برای اینترانت کلینیک */
export function Sidebar({
  header,
  footer,
  className,
  children,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className={cn("flex w-64 flex-col border-e border-border bg-card p-3 shadow-xs", className)}>
      {header && <div className="border-b border-border/70 px-2 pb-4 pt-2">{header}</div>}
      <nav className="flex-1 space-y-1 py-3">{children}</nav>
      {footer && <div className="border-t border-border/70 px-2 pt-3">{footer}</div>}
    </aside>
  );
}
