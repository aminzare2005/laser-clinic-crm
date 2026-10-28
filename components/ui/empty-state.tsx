import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** حالت خالی استاندارد VibeFarsi */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-surface border border-dashed border-border bg-card/60 p-10 text-center shadow-xs",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-muted-foreground shadow-inner">
        <Icon className="size-6" />
      </span>
      <p className="mt-2 text-sm font-bold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
