import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={cn("h-2.5 overflow-hidden rounded-full bg-[var(--border)]", className)}
      role="progressbar"
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${safeValue}%`,
          background: `linear-gradient(90deg, var(--primary), var(--secondary))`
        }}
      />
    </div>
  );
}
