"use client";

import { useEffect, useRef } from "react";

// Resonance as a phase field. Each frame is drawn as a short line at its phase
// angle. Coupling pulls neighbours toward the same angle, so coherent regions
// lock into parallel domains that rotate together — that local alignment is
// resonance. Where a region locks, its ticks brighten and lengthen, so the
// moment of coming into phase is the visible event; domain boundaries, where
// rates disagree, stay short and faint. Black/white, currentColor.
const GRIDN = 8; // GRIDN×GRIDN frames
const K = 0.55; // coupling toward neighbour alignment
const STEP = 0.05;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P = { x: number; y: number; omega: number; nbrs: number[] };

const NODES: P[] = (() => {
  const rng = mulberry32(20260615);
  const cell = 1 / GRIDN;
  const pts: P[] = [];
  for (let r = 0; r < GRIDN; r++) {
    for (let c = 0; c < GRIDN; c++) {
      const x = Math.min(0.95, Math.max(0.05, (c + 0.5) * cell + (rng() - 0.5) * cell * 0.6));
      const y = Math.min(0.95, Math.max(0.05, (r + 0.5) * cell + (rng() - 0.5) * cell * 0.6));
      // Smooth spatial variation in natural rate → coherent regions plus a few
      // boundaries where rates disagree.
      const omega = 0.22 + 0.18 * Math.sin(x * 4.2 + 1) * Math.cos(y * 3.6) + (rng() - 0.5) * 0.05;
      pts.push({ x, y, omega, nbrs: [] });
    }
  }
  const rad = 1.45 * cell;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if ((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2 < rad * rad) {
        pts[i].nbrs.push(j);
        pts[j].nbrs.push(i);
      }
    }
  }
  return pts;
})();

const THETA0 = (() => {
  const rng = mulberry32(7);
  return NODES.map(() => rng() * Math.PI * 2);
})();

export function ResonanceFigure() {
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

    const theta = THETA0.slice();
    const next = new Float32Array(theta.length);

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
      const m = Math.min(w, h);

      // Kuramoto step: each frame turns toward its own rate plus its neighbours.
      for (let i = 0; i < NODES.length; i++) {
        let s = 0;
        for (const j of NODES[i].nbrs) s += Math.sin(theta[j] - theta[i]);
        next[i] = theta[i] + STEP * (NODES[i].omega + (K * s) / Math.max(1, NODES[i].nbrs.length));
      }
      for (let i = 0; i < theta.length; i++) theta[i] = next[i];

      // Local alignment (order) per frame, over itself and its neighbours.
      const order = new Float32Array(theta.length);
      for (let i = 0; i < NODES.length; i++) {
        let cx = Math.cos(theta[i]);
        let cy = Math.sin(theta[i]);
        for (const j of NODES[i].nbrs) {
          cx += Math.cos(theta[j]);
          cy += Math.sin(theta[j]);
        }
        const n = 1 + NODES[i].nbrs.length;
        order[i] = Math.hypot(cx, cy) / n;
      }

      // Faint links between aligned neighbours — the field knitting together.
      ctx.strokeStyle = color;
      for (let i = 0; i < NODES.length; i++) {
        for (const j of NODES[i].nbrs) {
          if (j < i) continue;
          const coh = 0.5 + 0.5 * Math.cos(theta[i] - theta[j]);
          if (coh < 0.6) continue;
          ctx.globalAlpha = 0.12 * (coh - 0.6) * 2.5;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(NODES[i].x * w, NODES[i].y * h);
          ctx.lineTo(NODES[j].x * w, NODES[j].y * h);
          ctx.stroke();
        }
      }

      // Phase-angle ticks: brighter and longer where the region has locked.
      ctx.lineCap = "round";
      for (let i = 0; i < NODES.length; i++) {
        const o = order[i];
        const hl = (0.018 + 0.016 * o) * m; // half-length grows with alignment
        const cx = NODES[i].x * w;
        const cy = NODES[i].y * h;
        const dx = Math.cos(theta[i]) * hl;
        const dy = Math.sin(theta[i]) * hl;
        ctx.globalAlpha = 0.22 + 0.7 * o;
        ctx.lineWidth = 1 + 1.4 * o;
        ctx.beginPath();
        ctx.moveTo(cx - dx, cy - dy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
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
