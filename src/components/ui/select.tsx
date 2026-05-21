import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectOption = { label: string; value: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label className="block text-sm font-medium text-[var(--muted-foreground)]" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <select
          className={cn(
            "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-sm px-3.5 text-sm outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(91,155,213,0.2)]",
            error && "border-[var(--danger)]",
            className
          )}
          id={inputId}
          ref={ref}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
      </div>
    );
  }
);

Select.displayName = "Select";
