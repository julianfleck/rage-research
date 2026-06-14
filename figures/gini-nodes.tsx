"use client";

import { useEffect, useRef } from "react";

// Gini as a graph of frames. Each node is a frame; its size/brightness is its
// share of activation. Every PAIR is an edge whose brightness is |xᵢ − xⱼ| —
// which is exactly what the coefficient sums. So an even spread shows bright,
// equal nodes with no edges (G ≈ 0); concentration lights up spokes from the
// hub to everything else (G high). Borrows the hero's node/edge language.
// Black and white; colour from currentColor.
const N = 9;

// Same shape spread increasingly unevenly, then looping. Gini is scale-free
// (normalised by the mean), so the totals needn't match.
const DISTS: number[][] = [
  [5, 5, 5, 5, 5, 5, 5, 5, 5],
  [9, 8, 6, 5, 4, 4, 3, 3, 2],
  [16, 9, 6, 4, 3, 2, 2, 2, 1],
  [28, 6, 4, 3, 2, 2, 1, 1, 1],
  [40, 1, 1, 1, 1, 1, 1, 1, 1],
];
const HOLD = 900;
const TRANSITION = 420;

// Node positions on a ring (fixed; only the values morph).
const POS: [number, number][] = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * Math.PI * 2 - Math.PI / 2;
  return [0.5 + Math.cos(a) * 0.34, 0.5 + Math.sin(a) * 0.34];
});

function gini(xs: number[]): number {
  const n = xs.length;
  const sum = xs.reduce((a, b) => a + b, 0);
  if (sum <= 0 || n === 0) return 0;
  let diff = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) diff += Math.abs(xs[i] - xs[j]);
  return diff / (2 * n * sum);
}

export function GiniNodes() {
  const ref = useRef<HTMLCanvasElement>(null);
  const gRef = useRef<HTMLSpanElement>(null);

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

    // Morph clock.
    let step = 0;
    let t0 = performance.now();
    const ease = (k: number) => 1 - Math.pow(1 - k, 3);

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

    const vals = new Array(N).fill(5);

    const draw = (now: number) => {
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;

      // Interpolate the current distribution: transition, then hold, then advance.
      const from = DISTS[step];
      const to = DISTS[(step + 1) % DISTS.length];
      const dt = now - t0;
      if (dt < TRANSITION) {
        const e = ease(dt / TRANSITION);
        for (let i = 0; i < N; i++) vals[i] = from[i] + (to[i] - from[i]) * e;
      } else {
        for (let i = 0; i < N; i++) vals[i] = to[i];
        if (dt >= TRANSITION + HOLD) {
          step = (step + 1) % DISTS.length;
          t0 = now;
        }
      }

      const max = Math.max(...vals);
      ctx.clearRect(0, 0, w, h);
      const sc = (p: [number, number]): [number, number] => [p[0] * w, p[1] * h];

      // Edges = pairs, brightness ∝ |xᵢ − xⱼ| (the Gini summand).
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.abs(vals[i] - vals[j]) / max;
          if (d < 0.04) continue;
          ctx.globalAlpha = Math.min(0.75, 0.12 + 0.7 * d);
          const a = sc(POS[i]);
          const b = sc(POS[j]);
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();
        }
      }

      // Nodes — size + brightness carry each frame's share.
      ctx.fillStyle = color;
      const base = 0.012 * Math.min(w, h);
      for (let i = 0; i < N; i++) {
        const s = vals[i] / max;
        const [x, y] = sc(POS[i]);
        ctx.globalAlpha = 0.22 + 0.78 * s;
        ctx.beginPath();
        ctx.arc(x, y, base * (0.7 + 1.9 * Math.sqrt(s)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (gRef.current) gRef.current.textContent = gini(vals).toFixed(2);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        t0 = performance.now();
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
      <div className="pointer-events-none absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        G = <span ref={gRef} className="tabular-nums text-foreground" />
      </div>
    </div>
  );
}
