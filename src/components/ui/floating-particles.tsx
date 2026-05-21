"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  type: "heart" | "circle" | "star";
  drift: number;
};

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createParticle(): Particle {
      const types: Particle["type"][] = ["heart", "circle", "star"];
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + 20,
        size: 4 + Math.random() * 8,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.08 + Math.random() * 0.12,
        type: types[Math.floor(Math.random() * 3)],
        drift: (Math.random() - 0.5) * 0.3
      };
    }

    function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      ctx.beginPath();
      const s = size * 0.6;
      ctx.moveTo(x, y + s * 0.3);
      ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.3);
      ctx.bezierCurveTo(x - s, y + s * 0.7, x, y + s, x, y + s * 1.2);
      ctx.bezierCurveTo(x, y + s, x + s, y + s * 0.7, x + s, y + s * 0.3);
      ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
      ctx.fill();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      if (particles.length < 15 && Math.random() < 0.02) {
        particles.push(createParticle());
      }

      particles = particles.filter((p) => p.y > -20);

      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(p.y * 0.01) * 0.2;
        p.opacity *= 0.999;

        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = "var(--primary-light)";
        ctx!.strokeStyle = "var(--primary-light)";

        if (p.type === "heart") {
          drawHeart(ctx!, p.x, p.y, p.size);
        } else if (p.type === "circle") {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          ctx!.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = p.size * 0.4;
            const method = i === 0 ? "moveTo" : "lineTo";
            ctx![method](p.x + r * Math.cos(angle), p.y + r * Math.sin(angle));
          }
          ctx!.closePath();
          ctx!.fill();
        }
      }

      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      className="pointer-events-none fixed inset-0 z-0"
      ref={canvasRef}
      style={{ opacity: 0.6 }}
    />
  );
}
