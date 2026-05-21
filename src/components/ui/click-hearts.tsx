"use client";

import { useCallback, useEffect, useRef } from "react";

export function ClickHearts() {
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnHeart = useCallback((x: number, y: number) => {
    const heart = document.createElement("div");
    heart.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--heart-click)" stroke="rgba(232,160,176,0.4)" stroke-width="0.5"/></svg>`;
    heart.style.cssText = `
      position: fixed;
      left: ${x - 12}px;
      top: ${y - 12}px;
      pointer-events: none;
      z-index: 9999;
      animation: float-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      filter: drop-shadow(0 2px 4px rgba(232,160,176,0.3));
    `;

    const offset = (Math.random() - 0.5) * 30;
    heart.style.setProperty("--x-drift", `${offset}px`);
    heart.style.animation = `float-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [data-no-heart]")) return;

      for (let i = 0; i < 2; i++) {
        setTimeout(() => {
          spawnHeart(
            e.clientX + (Math.random() - 0.5) * 16,
            e.clientY + (Math.random() - 0.5) * 16
          );
        }, i * 80);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [spawnHeart]);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-[9998]" />;
}
