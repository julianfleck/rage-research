"use client";

import { useEffect, useRef } from "react";

// Resonance. Frames are phase oscillators. Where they are both coupled and
// coherent — here, within a cluster — they pull each other into phase and pulse
// in unison: they resonate, and the bonds between them brighten as they lock.
// Weakly tied frames across clusters stay out of phase, and those bonds stay
// faint. Two clusters run at their own tempo, each resonating internally. So the
// figure shows resonance itself — how strongly a region vibrates together — not
// what is retrieved from it. Black/white, currentColor.

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type FNode = { x: number; y: number; theta: number; omega: number; cluster: number };

const { nodes: NODES, edges: EDGES } = (() => {
  const rng = mulberry32(20260614);
  const clusters = [
    { cx: 0.33, cy: 0.46, base: 0.9 },
    { cx: 0.66, cy: 0.54, base: 1.22 },
  ];
  const M = 6;
  const nodes: FNode[] = [];
  clusters.forEach((c, ci) => {
    for (let i = 0; i < M; i++) {
      const a = (i / M) * Math.PI * 2 + rng() * 0.5;
      const r = 0.1 + rng() * 0.05;
      nodes.push({
        x: c.cx + Math.cos(a) * r,
        y: c.cy + Math.sin(a) * r,
        theta: rng() * Math.PI * 2,
        omega: c.base + (rng() - 0.5) * 0.08,
        cluster: ci,
      });
    }
  });
  // Intra-cluster edges (strong): each node to its two nearest in-cluster peers.
  const edges: { i: number; j: number; K: number }[] = [];
  const seen = new Set<string>();
  const add = (i: number, j: number, K: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ i, j, K });
  };
  nodes.forEach((n, i) => {
    const peers = nodes
      .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
      .filter((p) => p.j !== i && nodes[p.j].cluster === n.cluster)
      .sort((a, b) => a.d - b.d);
    for (let k = 0; k < 2 && k < peers.length; k++) add(i, peers[k].j, 0.95);
  });
  // A couple of weak bridges across clusters.
  add(2, 8, 0.14);
  add(4, 9, 0.14);
  return { nodes, edges };
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

    // Mutable phase state (seeded initial values copied from NODES).
    const theta = NODES.map((n) => n.theta);

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
      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;
      const step = 0.05;

      // Kuramoto: couplings pull connected phases toward alignment.
      const dθ = NODES.map((n) => n.omega);
      for (const e of EDGES) {
        const pull = Math.sin(theta[e.j] - theta[e.i]) * e.K;
        dθ[e.i] += pull;
        dθ[e.j] -= pull;
      }
      for (let i = 0; i < NODES.length; i++) theta[i] += step * dθ[i];

      // Bonds: brighten with phase coherence (bright when in phase).
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (const e of EDGES) {
        const coh = 0.5 + 0.5 * Math.cos(theta[e.i] - theta[e.j]);
        ctx.globalAlpha = e.K * (0.15 + 0.85 * coh) * (e.K > 0.5 ? 1 : 1.4);
        ctx.beginPath();
        ctx.moveTo(sx(NODES[e.i].x), sy(NODES[e.i].y));
        ctx.lineTo(sx(NODES[e.j].x), sy(NODES[e.j].y));
        ctx.stroke();
      }

      // Frames: pulse with their phase; a resonating cluster pulses in unison.
      ctx.fillStyle = color;
      for (let i = 0; i < NODES.length; i++) {
        const p = 0.5 + 0.5 * Math.sin(theta[i]);
        ctx.globalAlpha = 0.3 + 0.65 * p;
        ctx.beginPath();
        ctx.arc(sx(NODES[i].x), sy(NODES[i].y), 2 + 1.8 * p, 0, Math.PI * 2);
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
