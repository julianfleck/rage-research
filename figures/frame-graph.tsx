"use client";

import { useEffect, useRef } from "react";

// The frame graph under co-retrieval. Typed frames (glyphs) wired into a graph;
// a query lights one frame and activation spreads a few hops along the edges,
// so a connected region comes up together — co-retrieval. A membrane is painted
// around whatever is currently co-active, then fades as activation decays and a
// new query fires elsewhere. Black/white, currentColor.
const N = 22;
const TYPES = 6;
const GRID = 30;
const LEVELS = [0.3, 0.6];
const FLOOR = 0.05;
const PROP = 0.72; // activation passed per hop
const FIRE = 0.35; // activation above which a node propagates

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

// Deterministic graph: nodes in a disc, wired to nearest neighbours.
const { nodes: NODES, adj: ADJ } = (() => {
  const rng = mulberry32(20260615);
  const nodes = Array.from({ length: N }, () => {
    const r = Math.sqrt(rng()) * 0.42;
    const a = rng() * Math.PI * 2;
    return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r, type: (rng() * TYPES) | 0 };
  });
  const adj: number[][] = nodes.map(() => []);
  const seen = new Set<string>();
  for (let i = 0; i < N; i++) {
    const order = [...Array(N).keys()]
      .filter((j) => j !== i)
      .sort((p, q) => (nodes[i].x - nodes[p].x) ** 2 + (nodes[i].y - nodes[p].y) ** 2 - ((nodes[i].x - nodes[q].x) ** 2 + (nodes[i].y - nodes[q].y) ** 2));
    for (let k = 0; k < 3; k++) {
      const j = order[k];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }
  return { nodes, adj };
})();

export function FrameGraph() {
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

    const act = new Float32Array(N).fill(FLOOR);
    const next = new Float32Array(N);
    const fieldArr = new Float32Array((GRID + 1) * (GRID + 1));
    let nextQuery = 0.4;

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
          const Rg = () => cross(gx + 1, gy, gx + 1, gy + 1, b, c);
          const B = () => cross(gx, gy + 1, gx + 1, gy + 1, d, c);
          const L = () => cross(gx, gy, gx, gy + 1, a, d);
          const seg = (p: [number, number], q: [number, number]) => {
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          };
          switch (ci) {
            case 1: case 14: seg(L(), T()); break;
            case 2: case 13: seg(T(), Rg()); break;
            case 3: case 12: seg(L(), Rg()); break;
            case 4: case 11: seg(Rg(), B()); break;
            case 6: case 9: seg(T(), B()); break;
            case 7: case 8: seg(L(), B()); break;
            case 5: seg(L(), T()); seg(Rg(), B()); break;
            case 10: seg(T(), Rg()); seg(L(), B()); break;
          }
        }
      }
    };

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);
      const m = Math.min(w, h);

      // A new query lights a frame; activation then spreads along edges.
      if (t >= nextQuery) {
        act[Math.floor(((t * 53.7) % 1) * N) % N] = 1;
        nextQuery = t + 2.4;
      }
      for (let i = 0; i < N; i++) next[i] = FLOOR + (act[i] - FLOOR) * 0.94;
      for (let i = 0; i < N; i++) {
        if (act[i] > FIRE) for (const j of ADJ[i]) next[j] = Math.max(next[j], act[i] * PROP);
      }
      for (let i = 0; i < N; i++) act[i] = Math.min(1, Math.max(FLOOR, next[i]));

      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Membrane over the co-active region.
      fieldArr.fill(0);
      const sg = 0.055 * GRID;
      const rad = Math.ceil(3 * sg);
      const inv = 1 / (2 * sg * sg);
      for (let i = 0; i < N; i++) {
        const wgt = Math.max(0, act[i] - FLOOR) * 1.1;
        if (wgt < 0.04) continue;
        const sf = NODES[i].x * GRID;
        const tf = NODES[i].y * GRID;
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
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      LEVELS.forEach((lv, li) => {
        ctx.globalAlpha = 0.16 + li * 0.1;
        ctx.beginPath();
        contour(lv);
        ctx.stroke();
      });

      // Edges: faint, flashing where activation crosses them.
      for (let i = 0; i < N; i++) {
        for (const j of ADJ[i]) {
          if (j < i) continue;
          const fire = Math.max(act[i], act[j]) - FLOOR;
          ctx.globalAlpha = 0.12 + 0.6 * fire;
          ctx.beginPath();
          ctx.moveTo(sx(NODES[i].x), sy(NODES[i].y));
          ctx.lineTo(sx(NODES[j].x), sy(NODES[j].y));
          ctx.stroke();
        }
      }

      // Typed frames.
      ctx.fillStyle = color;
      const base = 0.016 * m;
      for (let i = 0; i < N; i++) {
        const a = act[i];
        ctx.globalAlpha = 0.2 + 0.75 * Math.max(a * a, 0);
        glyph(ctx, sx(NODES[i].x), sy(NODES[i].y), base * (1 + 0.4 * a), NODES[i].type);
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
