"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  /** "start" slides in from the right in RTL (the natural side for Persian). */
  side?: "start" | "end" | "bottom";
  children: React.ReactNode;
  className?: string;
}

const PANEL_MS = 320;
const PANEL_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const OVERLAY_MS = 200;

function panelHidden(side: NonNullable<SheetProps["side"]>) {
  if (side === "bottom") return "translate-y-full opacity-0";
  if (side === "start") return "ltr:-translate-x-full rtl:translate-x-full opacity-0";
  return "ltr:translate-x-full rtl:-translate-x-full opacity-0";
}

/** کشو VibeFarsi. A side panel for mobile navigation, filters and drawers. */
export function Sheet({
  open,
  onOpenChange,
  title,
  side = "start",
  children,
  className,
}: SheetProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const [present, setPresent] = React.useState(open);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setPresent(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = window.setTimeout(() => setPresent(false), PANEL_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!present) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [present, onOpenChange]);

  if (!mounted || !present) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        aria-hidden
        onClick={() => onOpenChange(false)}
        className={cn(
          "absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-[opacity,filter] ease-in-out",
          shown ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: `${OVERLAY_MS}ms` }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "absolute flex flex-col bg-white text-slate-900 shadow-2xl will-change-transform",
          "transition-[transform,opacity]",
          side === "start" && "inset-y-0 start-0 w-[280px] sm:w-[320px] max-w-[85vw] border-e border-slate-200",
          side === "end" && "inset-y-0 end-0 w-[280px] sm:w-[320px] max-w-[85vw] border-s border-slate-200",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t border-slate-200",
          shown ? "translate-x-0 translate-y-0 opacity-100" : panelHidden(side),
          className,
        )}
        style={{
          transitionDuration: `${PANEL_MS}ms`,
          transitionTimingFunction: PANEL_EASE,
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
          {title ? (
            <div id={titleId} className="text-sm font-bold text-slate-900">
              {title}
            </div>
          ) : (
            <div />
          )}
          <button
            type="button"
            aria-label="بستن"
            onClick={() => onOpenChange(false)}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
