"use client";

import { useEffect, useRef } from "react";

// Permeability as retrieval depth. A single subgraph drawn as a small tree: a
// summary node at the centre, then two levels of detail fanning out. A retrieval
// threshold on resonance sweeps up and down and the frontier follows: held high,
// only the most resonant node (the summary) comes back; as the threshold drops,
// the frontier reaches deeper and a richer subset of frames clears the bar.
// Illustrative, not interactive. Black/white, currentColor.

type Node = { x: number; y: number; level: number; parent: number };

// Deterministic radial tree: root (level 0), a ring of children (level 1), and
// grandchildren (level 2).
const NODES: Node[] = (() => {
  const out: Node[] = [{ x: 0.5, y: 0.5, level: 0, parent: -1 }];
  const L1 = 5;
  const r1 = 0.2;
  const r2 = 0.38;
  for (let i = 0; i < L1; i++) {
    const a = -Math.PI / 2 + (i / L1) * Math.PI * 2;
    const idx = out.length;
    out.push({ x: 0.5 + Math.cos(a) * r1, y: 0.5 + Math.sin(a) * r1, level: 1, parent: 0 });
    for (let k = -1; k <= 1; k += 2) {
      const aa = a + k * 0.34;
      out.push({ x: 0.5 + Math.cos(aa) * r2, y: 0.5 + Math.sin(aa) * r2, level: 2, parent: idx });
    }
  }
  return out;
})();

const MAX_LEVEL = 2;
const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

export function MembranePermeability() {
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

      // Retrieval reach breathes 0..1 (the threshold dropping and rising); the
      // frontier follows it.
      const reach = 0.5 + 0.5 * Math.sin(t * 0.3);
      const frontier = reach * MAX_LEVEL;
      // How fully each node is retrieved (soft frontier).
      const lit = (level: number) => smooth(frontier - level + 0.6);

      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Retrieval boundary — a soft circle that expands with resonance.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.25;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      const rr = (0.1 + 0.34 * res) * m;
      const STEPS = 80;
      for (let i = 0; i <= STEPS; i++) {
        const a = (i / STEPS) * Math.PI * 2;
        const wob = 1 + 0.03 * Math.sin(a * 3 + t);
        const x = 0.5 * w + Math.cos(a) * rr * wob;
        const y = 0.5 * h + Math.sin(a) * rr * wob;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Edges parent→child, visible once the child is being retrieved.
      ctx.lineWidth = 1;
      for (const n of NODES) {
        if (n.parent < 0) continue;
        const p = NODES[n.parent];
        const a = lit(n.level);
        if (a < 0.03) continue;
        ctx.globalAlpha = 0.5 * a;
        ctx.beginPath();
        ctx.moveTo(sx(p.x), sy(p.y));
        ctx.lineTo(sx(n.x), sy(n.y));
        ctx.stroke();
      }

      // Nodes — summary at the centre brightest, detail fades in by depth.
      ctx.fillStyle = color;
      for (const n of NODES) {
        const a = lit(n.level);
        ctx.globalAlpha = 0.14 + 0.78 * a;
        const rad = n.level === 0 ? 4 : n.level === 1 ? 2.6 : 1.8;
        ctx.beginPath();
        ctx.arc(sx(n.x), sy(n.y), rad, 0, Math.PI * 2);
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
        <span>summary</span>
        <span>rich subset</span>
      </div>
    </div>
  );
}
