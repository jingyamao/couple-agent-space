"use client";

import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-lg",
  xl: "size-16 text-2xl"
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      <img
        alt={name}
        className={cn("rounded-full object-cover", sizeClass, className)}
        src={src}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] font-bold text-white",
        sizeClass,
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
