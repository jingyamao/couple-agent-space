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
          <label
            className="block text-sm text-[var(--muted-foreground)]"
            htmlFor={inputId}
          >
            {label}
          </label>
        ) : null}
        <select
          className={cn(
            "h-10 w-full rounded-md border border-[var(--border)] bg-[#fffdf9] px-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(194,59,74,0.14)]",
            error && "border-[var(--primary)]",
            className
          )}
          id={inputId}
          ref={ref}
          {...props}
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs text-[var(--primary)]">{error}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
