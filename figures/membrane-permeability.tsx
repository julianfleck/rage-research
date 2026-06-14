"use client";

import { useEffect, useRef } from "react";

// Selective permeability as retrieval depth. A membrane runs down the middle with
// a single channel. The summary at the top of a subgraph sits on the left and is
// always there; when retrieval clears a threshold the channel opens, and the
// subgraph reaches through it — the deeper the threshold drops, the further into
// the subgraph it reads, so more detail crosses through the same channel. The
// retrieved region is drawn as an organic contour (marching squares) that bulges
// through the gap as depth grows, not a geometric shape. Black/white, currentColor.
const GRID = 32;
const LEVELS = [0.32, 0.62];
const MX = 0.5; // membrane x
const CYCLE = 2.6; // seconds per open/close cycle (snappy)

type Node = { x: number; y: number; level: number; parent: number; viaChannel: boolean };

// Root (summary) on the left; detail fans out on the right, reached through the
// channel. Root→level-1 edges route through the channel point.
const NODES: Node[] = (() => {
  const out: Node[] = [{ x: 0.17, y: 0.5, level: 0, parent: -1, viaChannel: false }];
  const l1y = [0.32, 0.5, 0.68];
  l1y.forEach((y) => {
    const p = out.length;
    out.push({ x: 0.66, y, level: 1, parent: 0, viaChannel: true });
    out.push({ x: 0.83, y: y - 0.09, level: 2, parent: p, viaChannel: false });
    out.push({ x: 0.83, y: y + 0.09, level: 2, parent: p, viaChannel: false });
  });
  return out;
})();

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

    const fieldArr = new Float32Array((GRID + 1) * (GRID + 1));

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

    const contour = (lv: number) => {
      const sx = w / GRID;
      const sy = h / GRID;
      const at = (gx: number, gy: number) => fieldArr[gy * (GRID + 1) + gx];
      const cross = (x0: number, y0: number, x1: number, y1: number, v0: number, v1: number): [number, number] => {
        const k = (lv - v0) / (v1 - v0);
        return [(x0 + (x1 - x0) * k) * sx, (y0 + (y1 - y0) * k) * sy];
      };
      for (let gy = 0; gy < GRID; gy++) {
        for (let gx = 0; gx < GRID; gx++) {
          const a = at(gx, gy);
          const b = at(gx + 1, gy);
          const c = at(gx + 1, gy + 1);
          const d = at(gx, gy + 1);
          let ci = 0;
          if (a > lv) ci |= 1;
          if (b > lv) ci |= 2;
          if (c > lv) ci |= 4;
          if (d > lv) ci |= 8;
          if (ci === 0 || ci === 15) continue;
          const T = () => cross(gx, gy, gx + 1, gy, a, b);
          const R = () => cross(gx + 1, gy, gx + 1, gy + 1, b, c);
          const B = () => cross(gx, gy + 1, gx + 1, gy + 1, d, c);
          const L = () => cross(gx, gy, gx, gy + 1, a, d);
          const seg = (p: [number, number], q: [number, number]) => {
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          };
          switch (ci) {
            case 1: case 14: seg(L(), T()); break;
            case 2: case 13: seg(T(), R()); break;
            case 3: case 12: seg(L(), R()); break;
            case 4: case 11: seg(R(), B()); break;
            case 6: case 9: seg(T(), B()); break;
            case 7: case 8: seg(L(), B()); break;
            case 5: seg(L(), T()); seg(R(), B()); break;
            case 10: seg(T(), R()); seg(L(), B()); break;
          }
        }
      }
    };

    const splat = (nx: number, ny: number, wgt: number) => {
      if (wgt < 0.04) return;
      const sg = 0.05 * GRID;
      const rad = Math.ceil(3 * sg);
      const inv = 1 / (2 * sg * sg);
      const sf = nx * GRID;
      const tf = ny * GRID;
      const gx0 = Math.max(0, Math.floor(sf - rad));
      const gx1 = Math.min(GRID, Math.ceil(sf + rad));
      const gy0 = Math.max(0, Math.floor(tf - rad));
      const gy1 = Math.min(GRID, Math.ceil(tf + rad));
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const ddx = gx - sf;
          const ddy = gy - tf;
          fieldArr[gy * (GRID + 1) + gx] += wgt * Math.exp(-(ddx * ddx + ddy * ddy) * inv);
        }
      }
    };

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);
      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Snappy threshold: a triangle, steepened, dwelling at open and closed.
      const phase = (t % CYCLE) / CYCLE;
      const tri = 1 - Math.abs(2 * phase - 1);
      const reach = smooth(smooth(tri)); // 0..1
      const open = smooth(Math.min(1, reach * 1.4)); // channel openness
      // Per-node retrieval: summary always; level 1 reaches through shallow, level 2 deep.
      const lit = (level: number) => (level === 0 ? 1 : smooth((reach - (level === 1 ? 0.12 : 0.5)) / 0.34));

      const chY = 0.5;
      const baseGap = 0.12;
      const gap = baseGap * (0.28 + 0.72 * open);

      // Build the retrieved-region field: nodes by retrieval weight, plus the
      // channel itself so the blob bridges the gap when open.
      fieldArr.fill(0);
      for (const n of NODES) splat(n.x, n.y, 0.95 * lit(n.level));
      splat(MX, chY, 0.9 * open);

      // Organic contour around what's retrieved.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      LEVELS.forEach((lv, li) => {
        ctx.globalAlpha = 0.16 + li * 0.1;
        ctx.beginPath();
        contour(lv);
        ctx.stroke();
      });

      // Membrane divider: a wavy vertical line with a gap at the channel.
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      const wob = (y: number) => MX + 0.014 * Math.sin(y * 22 + t * 0.6);
      const drawSeg = (y0: number, y1: number) => {
        ctx.beginPath();
        const steps = Math.max(2, Math.round((y1 - y0) * 40));
        for (let i = 0; i <= steps; i++) {
          const y = y0 + ((y1 - y0) * i) / steps;
          const x = sx(wob(y));
          if (i) ctx.lineTo(x, sy(y));
          else ctx.moveTo(x, sy(y));
        }
        ctx.stroke();
      };
      drawSeg(0, chY - gap);
      drawSeg(chY + gap, 1);

      // Channel lips: brighten as the channel opens.
      ctx.globalAlpha = 0.3 + 0.7 * open;
      ctx.lineWidth = 1 + 1.5 * open;
      [chY - gap, chY + gap].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(sx(wob(y)) - 5, sy(y));
        ctx.lineTo(sx(wob(y)) + 5, sy(y));
        ctx.stroke();
      });

      // Edges. Root→level-1 route through the channel point; the rest are local.
      ctx.lineWidth = 1;
      for (const n of NODES) {
        if (n.parent < 0) continue;
        const a = lit(n.level);
        if (a < 0.03) continue;
        const p = NODES[n.parent];
        ctx.globalAlpha = 0.5 * a;
        ctx.beginPath();
        ctx.moveTo(sx(p.x), sy(p.y));
        if (n.viaChannel) ctx.lineTo(sx(MX), sy(chY));
        ctx.lineTo(sx(n.x), sy(n.y));
        ctx.stroke();
      }

      // Flow along the trunk, through the channel, while it is open.
      if (open > 0.35) {
        const fp = (t * 0.7) % 1;
        const along = (a: number, b: number, u: number) => a + (b - a) * u;
        const root = NODES[0];
        ctx.globalAlpha = 0.55 * open;
        for (let s = 0; s < 3; s++) {
          const u = (fp + s / 3) % 1;
          const px = u < 0.5 ? along(root.x, MX, u / 0.5) : along(MX, 0.66, (u - 0.5) / 0.5);
          const py = u < 0.5 ? along(root.y, chY, u / 0.5) : chY;
          ctx.beginPath();
          ctx.arc(sx(px), sy(py), 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Nodes — summary largest, detail fades in by depth.
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
        <span>detail</span>
      </div>
    </div>
  );
}
