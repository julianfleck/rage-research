"use client";

import { useEffect, useRef } from "react";

// The divergence/convergence cycle. Frames flow through an envelope that fans
// open and pulls back, over and over — each bulge is a divergence (the space
// opening), each pinch a convergence through the constraints. The repetition is
// the point: healthy work oscillates between the two rather than running one way.
// Black/white, currentColor.
const N = 110;
const WMAX = 0.4; // half-height at the widest point
const CYCLES = 2; // diverge/converge lobes across the width

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Half-width of the envelope at x: a chain of lobes, pinched to a point between.
const widthAt = (x: number) => WMAX * (0.5 - 0.5 * Math.cos(CYCLES * 2 * Math.PI * x));

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
    const mk = (x: number): P => ({ x, u: rng() * 2 - 1, spd: 0.0028 + rng() * 0.0016, ph: rng() * 6.28 });
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

      // Envelope outline — the chain of lobes.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (const sign of [-1, 1]) {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        const STEPS = 120;
        for (let i = 0; i <= STEPS; i++) {
          const x = i / STEPS;
          const y = 0.5 + sign * widthAt(x);
          if (i) ctx.lineTo(x * w, y * h);
          else ctx.moveTo(x * w, y * h);
        }
        ctx.stroke();
      }

      // Frames flowing through: spread at the bulges, gather at the pinches.
      ctx.fillStyle = color;
      for (const p of parts) {
        p.x += p.spd;
        if (p.x > 1.03) Object.assign(p, mk(-0.03));
        const env = widthAt(p.x);
        const y = 0.5 + p.u * env + 0.004 * Math.sin(t * 2 + p.ph);
        const nw = env / WMAX; // 0 at a pinch, 1 at a bulge
        ctx.globalAlpha = 0.3 + 0.55 * (1 - nw); // brighter where it has converged
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

  return <canvas ref={ref} className="block h-full w-full" aria-hidden />;
}
