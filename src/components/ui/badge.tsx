import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "rose" | "teal" | "gold" | "neutral";

const tones: Record<BadgeTone, string> = {
  rose: "bg-[#f9dce0] text-[#8f2531]",
  teal: "bg-[#dceff0] text-[#145f65]",
  gold: "bg-[#fdecc0] text-[#6b4811]",
  neutral: "bg-[#ece7df] text-[#5d554d]"
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md px-2.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
