import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "brand" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:shadow-none",
  secondary: "bg-secondary text-secondary-foreground hover:bg-slate-200/80 border border-border shadow-sm active:shadow-none",
  outline: "border border-input bg-white text-foreground hover:bg-slate-50 hover:text-foreground shadow-sm active:shadow-none",
  ghost: "hover:bg-slate-100 hover:text-foreground text-foreground/80",
  brand: "bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm active:shadow-none",
  destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm active:shadow-none",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "size-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export function Button({ className, variant = "default", size = "md", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-control font-semibold transition-all duration-(--motion) ease-motion cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50 active:[transform:var(--press)]",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
