import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg active:scale-[0.97]",
  secondary:
    "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-md hover:bg-[var(--secondary-dark)] hover:shadow-lg active:scale-[0.97]",
  ghost:
    "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface)] active:scale-[0.97]",
  outline:
    "border border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-sm text-[var(--foreground)] hover:bg-[var(--surface-strong)] active:scale-[0.97]",
  danger:
    "bg-[var(--danger)] text-white shadow-md hover:opacity-90 active:scale-[0.97]"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs rounded-lg",
  md: "h-10 gap-2 px-4 text-sm rounded-xl",
  lg: "h-12 gap-2 px-6 text-base rounded-xl",
  icon: "size-10 p-0 rounded-xl"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      type={type}
      {...props}
    />
  );
}
