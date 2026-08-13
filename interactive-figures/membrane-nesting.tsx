"use client";

import { useEffect, useRef } from "react";

// Nesting and overlap. Three membranes drawn over one field of frames: a broad
// one, a tighter one nested inside it, and a third that overlaps the broad one,
// sharing frames without containing it. Each membrane is its own marching-squares
// contour, so the boundaries layer and cross — the picture of membranes over
// membranes, not a partition into tiles. Black/white, currentColor.
const GRID = 34;
const LEVEL = 0.5;

const NODES: [number, number][] = [
  [0.28, 0.4], [0.34, 0.3], [0.46, 0.34], [0.52, 0.44], [0.48, 0.58],
  [0.4, 0.63], [0.3, 0.55], [0.24, 0.46], [0.36, 0.46], [0.4, 0.5],
  [0.33, 0.52], [0.58, 0.4], [0.66, 0.34], [0.74, 0.46], [0.72, 0.58],
  [0.62, 0.63], [0.56, 0.53], [0.16, 0.74], [0.84, 0.3], [0.5, 0.14], [0.82, 0.66],
];

// Each membrane is the set of frames inside a disc. The discs are arranged so one
// sits inside another (nesting) and one straddles the broad disc (overlap).
const DISCS = [
  { cx: 0.39, cy: 0.47, r: 0.22, alpha: 0.42 }, // broad
  { cx: 0.36, cy: 0.49, r: 0.11, alpha: 0.66 }, // nested inside the broad one
  { cx: 0.65, cy: 0.5, r: 0.2, alpha: 0.42 }, //  overlaps the broad one
];

const MEMBERS = DISCS.map((d) =>
  NODES.map((n, i) => (Math.hypot(n[0] - d.cx, n[1] - d.cy) <= d.r ? i : -1)).filter((i) => i >= 0),
);
const MEMBERSHIP = NODES.map((_, i) => MEMBERS.filter((m) => m.includes(i)).length);

export function MembraneNesting() {
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
    const phase = NODES.map((_, i) => i * 1.7);

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

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);
      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Live positions: a gentle wobble so the contours breathe.
      const pos = NODES.map((n, i) => [n[0] + 0.006 * Math.sin(t * 0.7 + phase[i]), n[1] + 0.006 * Math.cos(t * 0.6 + phase[i])] as [number, number]);

      const sg = 0.052 * GRID;
      const rad = Math.ceil(3 * sg);
      const inv = 1 / (2 * sg * sg);

      // One contour per membrane, drawn from only its member frames.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      DISCS.forEach((disc, mi) => {
        fieldArr.fill(0);
        for (const idx of MEMBERS[mi]) {
          const sf = pos[idx][0] * GRID;
          const tf = pos[idx][1] * GRID;
          const gx0 = Math.max(0, Math.floor(sf - rad));
          const gx1 = Math.min(GRID, Math.ceil(sf + rad));
          const gy0 = Math.max(0, Math.floor(tf - rad));
          const gy1 = Math.min(GRID, Math.ceil(tf + rad));
          for (let gy = gy0; gy <= gy1; gy++) {
            for (let gx = gx0; gx <= gx1; gx++) {
              const ddx = gx - sf;
              const ddy = gy - tf;
              fieldArr[gy * (GRID + 1) + gx] += Math.exp(-(ddx * ddx + ddy * ddy) * inv);
            }
          }
        }
        ctx.globalAlpha = disc.alpha;
        ctx.beginPath();
        contour(LEVEL);
        ctx.stroke();
      });

      // Frames: brighter where they belong to more than one membrane.
      ctx.fillStyle = color;
      for (let i = 0; i < NODES.length; i++) {
        const m = MEMBERSHIP[i];
        ctx.globalAlpha = m === 0 ? 0.2 : 0.45 + 0.22 * m;
        ctx.beginPath();
        ctx.arc(sx(pos[i][0]), sy(pos[i][1]), m > 1 ? 2.2 : 1.6, 0, Math.PI * 2);
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
