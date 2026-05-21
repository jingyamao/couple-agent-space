"use client";

import { useEffect } from "react";

export function ClickHearts() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, button, a, [data-no-heart]")) return;

      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnHeart(e.clientX, e.clientY), i * 60);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

function spawnHeart(originX: number, originY: number) {
  const el = document.createElement("div");
  const size = 28 + Math.random() * 16;
  const drift = (Math.random() - 0.5) * 60;
  const duration = 1000 + Math.random() * 500;

  el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e8a0b0" fill-opacity="0.7" stroke="#d08090" stroke-width="0.5" stroke-opacity="0.4"/></svg>`;

  const startX = originX - size / 2 + (Math.random() - 0.5) * 20;
  const startY = originY - size / 2;

  el.style.cssText = `
    position: fixed;
    left: ${startX}px;
    top: ${startY}px;
    pointer-events: none;
    z-index: 99999;
    will-change: transform, opacity;
  `;

  document.body.appendChild(el);

  const anim = el.animate(
    [
      { transform: "translate(0, 0) scale(0.3) rotate(0deg)", opacity: 0.9 },
      { transform: `translate(${drift * 0.3}px, -40px) scale(1) rotate(${(Math.random() - 0.5) * 20}deg)`, opacity: 0.8, offset: 0.2 },
      { transform: `translate(${drift}px, -140px) scale(0.6) rotate(${(Math.random() - 0.5) * 30}deg)`, opacity: 0 }
    ],
    { duration, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "forwards" }
  );

  anim.onfinish = () => el.remove();
}
