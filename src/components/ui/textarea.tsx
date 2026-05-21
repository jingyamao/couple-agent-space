import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label className="block text-sm font-medium text-[var(--muted-foreground)]" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <textarea
          className={cn(
            "min-h-24 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-sm p-3.5 text-sm outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(91,155,213,0.2)]",
            error && "border-[var(--danger)]",
            className
          )}
          id={inputId}
          ref={ref}
          {...props}
        />
        {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
