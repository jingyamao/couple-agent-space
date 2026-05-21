import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "rose" | "teal" | "gold" | "neutral" | "primary";

const tones: Record<BadgeTone, string> = {
  rose: "bg-[var(--secondary-light)] text-[var(--secondary-dark)]",
  teal: "bg-[rgba(107,197,160,0.2)] text-[#3a8a6a]",
  gold: "bg-[rgba(255,209,102,0.25)] text-[#8a6a1a]",
  neutral: "bg-[rgba(122,142,160,0.12)] text-[var(--muted-foreground)]",
  primary: "bg-[rgba(91,155,213,0.15)] text-[var(--primary-dark)]"
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold transition-colors",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
