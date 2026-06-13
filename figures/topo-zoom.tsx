"use client";

import { useEffect, useRef } from "react";

// A map of the substrate: clusters scattered across an organic topography. The
// camera drifts out to show the whole map (clusters linked across the field),
// then zooms into one cluster, revealing its connected children and their
// children. Black and white; colour inherits from currentColor.
type Node = { x: number; y: number; cl: number; lvl: 0 | 1 | 2; parent: number };

const CC: [number, number][] = [
  [0.28, 0.34],
  [0.7, 0.28],
  [0.52, 0.56],
  [0.3, 0.72],
  [0.74, 0.68],
];
const NODES: Node[] = [];
const PEAK: number[] = [];
(() => {
  const push = (x: number, y: number, cl: number, lvl: 0 | 1 | 2, parent: number) => {
    NODES.push({ x, y, cl, lvl, parent });
    return NODES.length - 1;
  };
  CC.forEach(([cx, cy], ci) => {
    const peak = push(cx, cy, ci, 0, -1);
    PEAK[ci] = peak;
    const nch = 3 + (ci % 2);
    for (let j = 0; j < nch; j++) {
      const a = (j / nch) * Math.PI * 2 + ci * 0.7;
      const r = 0.05 + (0.02 * ((j * 5 + ci) % 3)) / 2;
      const chx = cx + Math.cos(a) * r;
      const chy = cy + Math.sin(a) * r;
      const ch = push(chx, chy, ci, 1, peak);
      // Vary how many leaves each child carries (0–3) so it doesn't read as a
      // uniform fan of pairs.
      const ngc = (ci * 2 + j * 3) % 4;
      for (let k = 0; k < ngc; k++) {
        const a2 = a + (k - (ngc - 1) / 2) * 0.5;
        const rr = 0.02 + 0.01 * ((j + k) % 2);
        push(chx + Math.cos(a2) * rr, chy + Math.sin(a2) * rr, ci, 2, ch);
      }
    }
  });
})();
// A few links across clusters — the interconnection that isn't a clean nesting.
const CROSS: [number, number][] = [
  [0, 2],
  [2, 4],
  [1, 2],
  [3, 2],
];
const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));

export function TopoZoom() {
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

    const Z = 3.2;
    const CYCLE = 4.4; // t-units per cluster visit

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);

      const ci = Math.floor(t / CYCLE) % CC.length;
      const u = (t % CYCLE) / CYCLE;
      let zf; // zoom fraction 0 (whole map) → 1 (deep in a cluster)
      if (u < 0.35) zf = smooth(u / 0.35);
      else if (u < 0.68) zf = 1;
      else zf = 1 - smooth((u - 0.68) / 0.32);
      const z = 1 + (Z - 1) * zf;
      const [tx, ty] = CC[ci];
      const fx = 0.5 + (tx - 0.5) * zf;
      const fy = 0.5 + (ty - 0.5) * zf;
      const sc = (x: number, y: number) => ({ x: (0.5 + (x - fx) * z) * w, y: (0.5 + (y - fy) * z) * h });
      const childVis = clamp((z - 1.5) / 0.8);
      const gcVis = clamp((z - 2.3) / 0.8);

      // Organic contour rings around each cluster (denser around the focused one).
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      CC.forEach(([cx, cy], k) => {
        const rings = k === ci ? [0.05, 0.09, 0.14, 0.2] : [0.07, 0.12];
        rings.forEach((rr, ri) => {
          ctx.globalAlpha = 0.06;
          ctx.beginPath();
          const steps = 40;
          for (let s = 0; s <= steps; s++) {
            const ang = (s / steps) * Math.PI * 2;
            const wob = 1 + 0.12 * Math.sin(ang * 3 + k * 1.3 + ri);
            const p = sc(cx + Math.cos(ang) * rr * wob, cy + Math.sin(ang) * rr * wob);
            if (s === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
        });
      });

      // Cross-cluster links — visible on the map, fading as we dive in.
      CROSS.forEach(([a, b]) => {
        const pa = sc(NODES[PEAK[a]].x, NODES[PEAK[a]].y);
        const pb = sc(NODES[PEAK[b]].x, NODES[PEAK[b]].y);
        ctx.globalAlpha = 0.16 * (1 - zf);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      // Edges to children/grandchildren, fading in with the zoom.
      for (const n of NODES) {
        if (n.parent < 0) continue;
        const v = n.lvl === 1 ? childVis : gcVis;
        if (v <= 0.01) continue;
        const a = sc(NODES[n.parent].x, NODES[n.parent].y);
        const b = sc(n.x, n.y);
        ctx.globalAlpha = 0.3 * v;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Nodes: cluster peaks always, finer ones revealed by zoom.
      ctx.fillStyle = color;
      for (const n of NODES) {
        const v = n.lvl === 0 ? 1 : n.lvl === 1 ? childVis : gcVis;
        if (v <= 0.01) continue;
        const s = sc(n.x, n.y);
        const base = n.lvl === 0 ? 5 : n.lvl === 1 ? 3.2 : 2;
        ctx.globalAlpha = 0.85 * v;
        ctx.beginPath();
        ctx.arc(s.x, s.y, base, 0, Math.PI * 2);
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
