import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            className="block text-sm text-[var(--muted-foreground)]"
            htmlFor={inputId}
          >
            {label}
          </label>
        ) : null}
        <input
          className={cn(
            "h-10 w-full rounded-md border border-[var(--border)] bg-[#fffdf9] px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(194,59,74,0.14)]",
            error && "border-[var(--primary)]",
            className
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[var(--primary)]">{error}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
