"use client";

import { useEffect, useRef } from "react";

// Two task runs side by side: a narrow task draws on a few tightly clustered
// framings; an open task spreads across many. This shows only the measurable
// difference in spread — no "appropriate" line, because we don't have one.
type Node = { x: number; y: number; p: number; grp: 0 | 1 };

const LEFT: [number, number][] = [
  [0.25, 0.5],
  [0.22, 0.45],
  [0.285, 0.46],
  [0.24, 0.555],
  [0.275, 0.55],
];
const RIGHT: [number, number][] = [
  [0.62, 0.24],
  [0.7, 0.2],
  [0.66, 0.3],
  [0.86, 0.46],
  [0.91, 0.53],
  [0.82, 0.55],
  [0.885, 0.41],
  [0.61, 0.7],
  [0.69, 0.74],
  [0.645, 0.66],
  [0.78, 0.32],
  [0.9, 0.7],
  [0.745, 0.62],
  [0.83, 0.74],
];

export function TaskSpread() {
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

    const nodes: Node[] = [
      ...LEFT.map(([x, y], i) => ({ x, y, p: i, grp: 0 as const })),
      ...RIGHT.map(([x, y], i) => ({ x, y, p: i + 10, grp: 1 as const })),
    ];

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

    // Gentle drift around each base position, so the figure breathes.
    const pos = (n: Node) => ({
      x: (n.x + Math.sin(t * 0.6 + n.p) * 0.012) * w,
      y: (n.y + Math.cos(t * 0.5 + n.p * 1.3) * 0.012) * h,
    });

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);

      // Divider between the two runs.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.moveTo(0.5 * w, 0.08 * h);
      ctx.lineTo(0.5 * w, 0.84 * h);
      ctx.stroke();

      // Couplings between nearby frames within the same run.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].grp !== nodes[j].grp) continue;
          const a = pos(nodes[i]);
          const b = pos(nodes[j]);
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const lim = (0.13 * w) ** 2;
          if (d2 < lim) {
            ctx.globalAlpha = 0.32 * (1 - d2 / lim);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Frames.
      ctx.fillStyle = color;
      for (const n of nodes) {
        const a = pos(n);
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 3, 0, Math.PI * 2);
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-around font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>narrow</span>
        <span>open</span>
      </div>
    </div>
  );
}
