"use client";

import { useEffect, useRef } from "react";

// The divergence/convergence cycle. Frames flow left to right through an
// envelope that opens then closes: a seed diverges to open the space, a band of
// constraints narrows it, and it converges on something usable. The classic
// shape of healthy work, repeated continuously. Black/white, currentColor.
const N = 90;
const WMAX = 0.42; // half-height of the widest point

const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

// Envelope half-width at x (0..1): rise (divergence), plateau (constraints),
// fall (convergence).
function widthAt(x: number) {
  const rise = smooth(x / 0.3);
  const fall = 1 - smooth((x - 0.52) / 0.43);
  return Math.max(0, Math.min(rise, fall));
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function DivergenceConvergence() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;
    let frame = 0;
    let color = "#888";
    const rng = mulberry32(20260615);

    type P = { x: number; u: number; spd: number; ph: number };
    const mk = (x: number): P => ({ x, u: rng() * 2 - 1, spd: 0.003 + rng() * 0.0018, ph: rng() * 6.28 });
    const parts: P[] = Array.from({ length: N }, () => mk(rng()));

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
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);
      const t = frame * 0.01;

      // Envelope outline.
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.32;
      ctx.lineWidth = 1;
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        const STEPS = 60;
        for (let i = 0; i <= STEPS; i++) {
          const x = i / STEPS;
          const y = 0.5 + sign * WMAX * widthAt(x);
          if (i) ctx.lineTo(x * w, y * h);
          else ctx.moveTo(x * w, y * h);
        }
        ctx.stroke();
      }

      // Frames flowing through, riding their lane within the envelope.
      ctx.fillStyle = color;
      for (const p of parts) {
        p.x += p.spd;
        if (p.x > 1.04) Object.assign(p, mk(-0.04));
        const env = widthAt(p.x);
        const y = 0.5 + p.u * WMAX * env + 0.004 * Math.sin(t * 2 + p.ph);
        // Brighten as the space converges (right side), dim while wide.
        ctx.globalAlpha = 0.3 + 0.55 * (1 - env);
        ctx.beginPath();
        ctx.arc(p.x * w, y * h, 1.5, 0, Math.PI * 2);
        ctx.fill();
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
        <span>divergence</span>
        <span>constraints</span>
        <span>convergence</span>
      </div>
    </div>
  );
}
