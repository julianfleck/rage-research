"use client";

import { useEffect, useRef } from "react";

// Membrane size as an intervention. One membrane breathes slowly over a fixed
// field of subgraphs — small clusters of connected frames, each a different
// type. As the membrane widens it takes in more whole subgraphs, so the variety
// it admits rises; as it tightens, the context narrows back down. Illustrative,
// not interactive. Black/white, currentColor.
const NC = 6; // subgraphs
const TYPES = 6;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, type: number) {
  ctx.beginPath();
  switch (type) {
    case 0:
      ctx.arc(cx, cy, s, 0, Math.PI * 2);
      break;
    case 1:
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s * 0.92, cy + s * 0.72);
      ctx.lineTo(cx - s * 0.92, cy + s * 0.72);
      ctx.closePath();
      break;
    case 2:
      ctx.rect(cx - s * 0.82, cy - s * 0.82, s * 1.64, s * 1.64);
      break;
    case 3:
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy);
      ctx.closePath();
      break;
    case 4:
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? s * 0.45 : s;
        const ang = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      break;
    default: {
      const tt = s * 0.4;
      ctx.rect(cx - tt, cy - s, tt * 2, s * 2);
      ctx.rect(cx - s, cy - tt, s * 2, tt * 2);
    }
  }
  ctx.fill();
}

// Deterministic field of subgraphs: cluster centres spread over a range of radii
// (so the breathing membrane sweeps over them one after another), each a small
// star of member frames sharing one type.
const CLUSTERS = (() => {
  const rng = mulberry32(20260614);
  const radii = [0.08, 0.17, 0.25, 0.31, 0.37, 0.42];
  return Array.from({ length: NC }, (_, i) => {
    const a = rng() * Math.PI * 2;
    const cx = 0.5 + Math.cos(a) * radii[i];
    const cy = 0.5 + Math.sin(a) * radii[i];
    const type = (rng() * TYPES) | 0;
    const M = 3 + ((rng() * 3) | 0);
    const members = Array.from({ length: M }, () => {
      const ma = rng() * Math.PI * 2;
      const mr = 0.03 + rng() * 0.035;
      return { x: cx + Math.cos(ma) * mr, y: cy + Math.sin(ma) * mr };
    });
    return { cx, cy, dist: radii[i], type, members };
  });
})();

const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

export function MembraneSize() {
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
      const cx = 0.5 * w;
      const cy = 0.5 * h;

      // Membrane size breathes between tight and wide.
      const rad = 0.3 + 0.15 * Math.sin(t * 0.32);
      const edge = 0.04;

      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;
      const base = 0.016 * m;

      // Subgraphs: a cluster lights up as the membrane sweeps over its centre.
      for (const c of CLUSTERS) {
        const inside = smooth((rad - c.dist) / edge + 0.5);
        const alpha = 0.14 + 0.78 * inside;

        // intra-cluster edges (centre → members)
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.45 * alpha;
        ctx.beginPath();
        for (const mem of c.members) {
          ctx.moveTo(sx(c.cx), sy(c.cy));
          ctx.lineTo(sx(mem.x), sy(mem.y));
        }
        ctx.stroke();

        // member frames (all one type per subgraph)
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        for (const mem of c.members) glyph(ctx, sx(mem.x), sy(mem.y), base, c.type);
        glyph(ctx, sx(c.cx), sy(c.cy), base * 1.15, c.type);
      }

      // Membrane contour — a gently wobbling circle of radius `rad`.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.25;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      const STEPS = 90;
      for (let i = 0; i <= STEPS; i++) {
        const a = (i / STEPS) * Math.PI * 2;
        const wob = 1 + 0.03 * Math.sin(a * 3 + t) + 0.02 * Math.cos(a * 5 - t * 0.7);
        const r = rad * m * wob;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
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
