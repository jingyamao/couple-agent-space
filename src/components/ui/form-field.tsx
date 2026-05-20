import { cn } from "@/lib/utils";

type FormFieldProps = {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label className="block text-sm text-[var(--muted-foreground)]">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-[var(--primary)]">{error}</p>
      ) : null}
    </div>
  );
}
