"use client";

import { useEffect, useRef } from "react";

// Belief attractor / premature convergence. A single membrane grows outward over
// a field of frames; whatever its growing edge reaches is captured and siphoned
// inward, so the region thickens as everything else thins, until one membrane has
// swallowed the whole field. Then it resets and plays out again. Black/white,
// currentColor.
const NF = 80;
const CYCLE = 9; // seconds for one membrane to swallow the field
const CX = 0.5;
const CY = 0.5;
const MAXR = 0.62;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

// Deterministic scattered frames (home positions + capture order by distance).
const FRAMES = (() => {
  const rng = mulberry32(20260615);
  return Array.from({ length: NF }, () => {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * 0.46;
    const hx = CX + Math.cos(a) * r;
    const hy = CY + Math.sin(a) * r;
    return { hx, hy, x: hx, y: hy, d0: r, captured: false };
  });
})();

export function BeliefAttractors() {
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
    let prevG = 0;

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
      const m = Math.min(w, h);

      // Growth phase 0..1; reset (release everything) when it wraps.
      const g = (t % CYCLE) / CYCLE;
      if (g < prevG) {
        for (const f of FRAMES) {
          f.captured = false;
          f.x = f.hx;
          f.y = f.hy;
        }
      }
      prevG = g;
      const radius = smooth(g) * MAXR; // growing membrane radius (normalized)

      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // The growing edge captures frames; captured ones are siphoned inward.
      let captured = 0;
      for (const f of FRAMES) {
        if (!f.captured && f.d0 <= radius) f.captured = true;
        if (f.captured) {
          f.x += (CX - f.x) * 0.025;
          f.y += (CY - f.y) * 0.025;
          captured++;
        }
      }
      const frac = captured / NF;

      // Membrane: a wobbling boundary that grows and brightens as it fills.
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.25 + 0.4 * frac;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      const STEPS = 90;
      for (let i = 0; i <= STEPS; i++) {
        const a = (i / STEPS) * Math.PI * 2;
        const wob = 1 + 0.05 * Math.sin(a * 3 + t) + 0.03 * Math.cos(a * 5 - t * 0.6);
        const rr = radius * m * wob;
        const x = sx(CX) + Math.cos(a) * rr;
        const y = sy(CY) + Math.sin(a) * rr;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Frames: captured ones bright and pulled in; free ones faint at home.
      ctx.fillStyle = color;
      for (const f of FRAMES) {
        ctx.globalAlpha = f.captured ? 0.85 : 0.22;
        ctx.beginPath();
        ctx.arc(sx(f.x), sy(f.y), f.captured ? 1.6 : 1.4, 0, Math.PI * 2);
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
