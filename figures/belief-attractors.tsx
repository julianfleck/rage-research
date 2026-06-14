"use client";

import { useEffect, useRef } from "react";

// Belief attractors. A few wells pull drifting frames; whatever a well captures
// adds to its mass, so it pulls harder and captures more — rich-get-richer. One
// well runs away and swallows the field: premature convergence. After it
// dominates, the cycle resets and the field redistributes, so the collapse plays
// out again. Black/white, currentColor.
const NA = 3; // attractors
const NP = 64; // drifting frames
const G = 0.00008; // gravity
const SOFT = 0.012;
const CAPTURE = 0.045;
const RESET = 9; // seconds before the field redistributes

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ATTR = [
  { x: 0.32, y: 0.4 },
  { x: 0.68, y: 0.38 },
  { x: 0.5, y: 0.7 },
];

export function BeliefAttractors() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let lastReset = 0;
    let w = 0;
    let h = 0;
    let frame = 0;
    let color = "#888";
    const rng = mulberry32(20260615);

    const mass = new Float32Array(NA).fill(1);
    type P = { x: number; y: number; vx: number; vy: number };
    const spawn = (): P => {
      const a = rng() * Math.PI * 2;
      const r = 0.34 + rng() * 0.12;
      return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r, vx: (rng() - 0.5) * 0.004, vy: (rng() - 0.5) * 0.004 };
    };
    const parts: P[] = Array.from({ length: NP }, spawn);

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
      const m = Math.min(w, h);

      // Reset the cycle once a well has run away.
      if (t - lastReset > RESET) {
        lastReset = t;
        for (let k = 0; k < NA; k++) mass[k] = 1;
        for (const p of parts) Object.assign(p, spawn());
      }

      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Particles fall toward the wells; capture feeds the well's mass.
      for (const p of parts) {
        let ax = 0;
        let ay = 0;
        for (let k = 0; k < NA; k++) {
          const dx = ATTR[k].x - p.x;
          const dy = ATTR[k].y - p.y;
          const d2 = dx * dx + dy * dy + SOFT;
          const f = (G * mass[k]) / d2;
          ax += f * dx;
          ay += f * dy;
          if (d2 < CAPTURE * CAPTURE + SOFT) {
            mass[k] += 0.05;
            Object.assign(p, spawn());
            ax = ay = 0;
            break;
          }
        }
        p.vx = (p.vx + ax) * 0.99;
        p.vy = (p.vy + ay) * 0.99;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Wells: concentric rings whose depth and brightness grow with mass.
      const total = mass.reduce((a, b) => a + b, 0);
      for (let k = 0; k < NA; k++) {
        const share = mass[k] / total; // 0..1 dominance
        const rings = 2 + Math.round(share * 5);
        const rad = (0.04 + 0.13 * share) * m;
        ctx.strokeStyle = color;
        for (let i = 1; i <= rings; i++) {
          ctx.globalAlpha = (0.1 + 0.5 * share) * (1 - (i - 1) / (rings + 1));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx(ATTR[k].x), sy(ATTR[k].y), (rad * i) / rings, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 + 0.6 * share;
        ctx.beginPath();
        ctx.arc(sx(ATTR[k].x), sy(ATTR[k].y), 1.6 + 2.4 * share, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drifting frames.
      ctx.fillStyle = color;
      for (const p of parts) {
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(sx(p.x), sy(p.y), 1.4, 0, Math.PI * 2);
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
