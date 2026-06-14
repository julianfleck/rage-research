"use client";

import { useEffect, useRef } from "react";

// Homogenization drift. Typed frames flow left → right; they arrive as a varied
// mix of types and, as write-back concentrates on what already dominates, cross
// a moving "collapse front" and convert to the single dominant type. So the left
// reads varied, the right uniform — the substrate-level analogue of model
// collapse. Distinct from hill-types (a graph morphing both ways) and task-spread
// (two static runs): this is one-directional drift over time. B/W, currentColor.
const N = 40;
const DOMINANT = 0;
const TYPES = [0, 1, 2, 3, 4, 5];

function glyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, type: number) {
  ctx.beginPath();
  switch (type) {
    case 0:
      ctx.arc(cx, cy, s, 0, Math.PI * 2);
      break;
    case 1:
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s * 0.92, cy + s * 0.72);
      ctx.lineTo(cx - s * 0.92, cy + s * 0.72);
      ctx.closePath();
      break;
    case 2:
      ctx.rect(cx - s * 0.86, cy - s * 0.86, s * 1.72, s * 1.72);
      break;
    case 3:
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy);
      ctx.closePath();
      break;
    case 4:
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? s * 0.45 : s;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      break;
    default: {
      const t = s * 0.4;
      ctx.rect(cx - t, cy - s, t * 2, s * 2);
      ctx.rect(cx - s, cy - t, s * 2, t * 2);
    }
  }
  ctx.fill();
}

const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

export function TypeDrift() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let w = 0;
    let h = 0;
    let frame = 0;
    let color = "#888";
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    type F = { x: number; y: number; bob: number; ph: number; type: number };
    const mk = (x: number): F => ({ x, y: rnd(0.16, 0.84), bob: rnd(0.01, 0.03), ph: rnd(0, 6.28), type: TYPES[(Math.random() * 6) | 0] });
    const frames: F[] = Array.from({ length: N }, () => mk(Math.random()));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);

      // The collapse front drifts slowly, so homogenization advances and recedes.
      const front = 0.32 + 0.12 * Math.sin(t * 0.18);
      const band = 0.34;
      const base = 0.02 * Math.min(w, h);

      ctx.fillStyle = color;
      for (const f of frames) {
        f.x += 0.0011;
        if (f.x > 1.05) {
          f.x -= 1.1;
          f.y = rnd(0.16, 0.84);
          f.type = TYPES[(Math.random() * 6) | 0]; // fresh variety enters on the left
        }
        const conv = smooth((f.x - front) / band);
        const sx = f.x * w;
        const sy = (f.y + Math.sin(t + f.ph) * f.bob) * h;
        if (conv < 0.97) {
          ctx.globalAlpha = 0.85 * (1 - conv);
          glyph(ctx, sx, sy, base, f.type);
        }
        if (conv > 0.03) {
          ctx.globalAlpha = 0.85 * conv;
          glyph(ctx, sx, sy, base, DOMINANT);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="block h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>varied</span>
        <span>homogenized</span>
      </div>
    </div>
  );
}
