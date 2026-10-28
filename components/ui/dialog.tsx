"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  role?: "dialog" | "alertdialog";
  className?: string;
}

/** پنجره (مودال) VibeFarsi */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  role = "dialog",
  className,
}: DialogProps) {
  const panel = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("[data-autofocus], button, input, textarea, select, a[href]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus();
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onClick={() => role === "dialog" && onOpenChange(false)}
    >
      <div
        ref={panel}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-lg rounded-surface border border-border bg-white p-6 text-foreground shadow-overlay animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        {(title || role === "dialog") && (
          <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3.5 mb-4">
            <div>
              {title && <h2 id={titleId} className="text-base font-bold text-slate-900">{title}</h2>}
              {description && <p id={descId} className="mt-1 text-xs text-muted-foreground">{description}</p>}
            </div>
            {role === "dialog" && (
              <button
                type="button"
                aria-label="بستن"
                onClick={() => onOpenChange(false)}
                className="-me-1.5 -mt-1.5 flex size-8 cursor-pointer items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
              >
                <X className="size-4.5" />
              </button>
            )}
          </div>
        )}
        {children && <div>{children}</div>}
        {footer && <div className="mt-6 flex flex-row justify-end gap-2.5 pt-3 border-t border-border/60">{footer}</div>}
      </div>
    </div>
  );
}
