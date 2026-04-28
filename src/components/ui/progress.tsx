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
      className={cn("h-2 overflow-hidden rounded-full bg-[#e7dfd5]", className)}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-[var(--secondary)] transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
