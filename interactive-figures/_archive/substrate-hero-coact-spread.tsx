"use client";

import { useEffect, useRef } from "react";

// Hero — activation spreading over the substrate. Frames sit in a sparse coupling
// graph. Energy is injected at a frame (it flashes white), then fires along
// couplings to neighbours. Co-activated frames have gravity — they pull together
// into a dense region wrapped by a membrane; the decay clock fades activation and
// loosens that gravity, so the cluster disperses again before the next injection.
// Black and white; inherits currentColor.
const GRID = 36;
const LEVELS = [0.3, 0.55, 0.8];
const N = 74;

export function SubstrateHeroCoact() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let frame = 0;
    let w = 0;
    let h = 0;
    let color = "#888";
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    type Node = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; a: number };
    const nodes: Node[] = Array.from({ length: N }, (_, i) => {
      const ang = i * 2.399963;
      const r = Math.sqrt((i + 0.5) / N) * 0.5;
      const x = 0.5 + Math.cos(ang) * r;
      const y = 0.5 + Math.sin(ang) * r;
      return { hx: x, hy: y, x, y, vx: 0, vy: 0, a: 0 };
    });

    // Sparse coupling graph: each frame to its 2 nearest (by home position).
    const adj: number[][] = nodes.map(() => []);
    const edges: [number, number][] = [];
    {
      const seen = new Set<string>();
      for (let i = 0; i < N; i++) {
        const order = [...Array(N).keys()]
          .filter((j) => j !== i)
          .sort((a, b) => {
            const da = (nodes[i].hx - nodes[a].hx) ** 2 + (nodes[i].hy - nodes[a].hy) ** 2;
            const db = (nodes[i].hx - nodes[b].hx) ** 2 + (nodes[i].hy - nodes[b].hy) ** 2;
            return da - db;
          });
        for (let k = 0; k < 3; k++) {
          const j = order[k];
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            edges.push([Math.min(i, j), Math.max(i, j)]);
            adj[i].push(j);
            adj[j].push(i);
          }
        }
      }
    }

    const next = new Float32Array(N);
    const fieldArr = new Float32Array((GRID + 1) * (GRID + 1));
    let nextInject = 0.5;

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
            case 1:
            case 14:
              seg(L(), T());
              break;
            case 2:
            case 13:
              seg(T(), R());
              break;
            case 3:
            case 12:
              seg(L(), R());
              break;
            case 4:
            case 11:
              seg(R(), B());
              break;
            case 6:
            case 9:
              seg(T(), B());
              break;
            case 7:
            case 8:
              seg(L(), B());
              break;
            case 5:
              seg(L(), T());
              seg(R(), B());
              break;
            case 10:
              seg(T(), R());
              seg(L(), B());
              break;
          }
        }
      }
    };

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);

      const z = 1.12 + 0.1 * Math.sin(t * 0.12);
      const fx = 0.5 + 0.06 * Math.cos(t * 0.04);
      const fy = 0.5 + 0.06 * Math.sin(t * 0.034);
      const toScreen = (wx: number, wy: number): [number, number] => [((wx - fx) * z + 0.5) * w, ((wy - fy) * z + 0.5) * h];

      // Inject energy at a frame (white flash), seeding a firing pattern.
      if (t >= nextInject) {
        const i = Math.floor(Math.random() * N);
        nodes[i].a = 1;
        for (const j of adj[i]) nodes[j].a = Math.max(nodes[j].a, 0.85);
        nextInject = t + rnd(0.3, 0.7);
      }

      // Activation propagates as a spike: everything decays (the decay clock),
      // and a firing frame pushes a weaker pulse to its neighbours — so the
      // pattern travels along couplings and dies out rather than self-sustaining.
      for (let i = 0; i < N; i++) next[i] = nodes[i].a * 0.9;
      for (let i = 0; i < N; i++) {
        const ai = nodes[i].a;
        if (ai > 0.45) for (const j of adj[i]) next[j] = Math.max(next[j], ai * 0.72);
      }
      for (let i = 0; i < N; i++) nodes[i].a = next[i];

      // Forces: co-activation gravity (pull co-active frames together), home
      // spring (decay loosens, so cooled frames drift back), short-range repulsion.
      for (const n of nodes) {
        n.vx += 0.004 * (1 - n.a) * (n.hx - n.x);
        n.vy += 0.004 * (1 - n.a) * (n.hy - n.y);
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1e-6) continue;
          const d = Math.sqrt(d2);
          const ux = dx / d;
          const uy = dy / d;
          if (d < 0.04) {
            const rep = 0.0035 * (1 - d / 0.04);
            a.vx -= rep * ux;
            a.vy -= rep * uy;
            b.vx += rep * ux;
            b.vy += rep * uy;
          } else if (d < 0.22 && a.a > 0.3 && b.a > 0.3) {
            const g = 0.0006 * a.a * b.a;
            a.vx += g * ux;
            a.vy += g * uy;
            b.vx -= g * ux;
            b.vy -= g * uy;
          }
        }
      }
      for (const n of nodes) {
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Membrane from the co-activated frames.
      fieldArr.fill(0);
      const sg = 0.05 * z * GRID;
      const rad = Math.ceil(3 * sg);
      const inv = 1 / (2 * sg * sg);
      for (const n of nodes) {
        if (n.a < 0.06) continue;
        const sf = ((n.x - fx) * z + 0.5) * GRID;
        const tf = ((n.y - fy) * z + 0.5) * GRID;
        const gx0 = Math.max(0, Math.floor(sf - rad));
        const gx1 = Math.min(GRID, Math.ceil(sf + rad));
        const gy0 = Math.max(0, Math.floor(tf - rad));
        const gy1 = Math.min(GRID, Math.ceil(tf + rad));
        for (let gy = gy0; gy <= gy1; gy++) {
          for (let gx = gx0; gx <= gx1; gx++) {
            const ddx = gx - sf;
            const ddy = gy - tf;
            fieldArr[gy * (GRID + 1) + gx] += n.a * 0.5 * Math.exp(-(ddx * ddx + ddy * ddy) * inv);
          }
        }
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      LEVELS.forEach((lv, li) => {
        ctx.globalAlpha = 0.16 + li * 0.09;
        ctx.beginPath();
        contour(lv);
        ctx.stroke();
      });

      // Couplings — faint at rest, brighter where activation is firing.
      for (const [i, j] of edges) {
        const m = Math.max(nodes[i].a, nodes[j].a);
        ctx.globalAlpha = 0.03 + 0.4 * m;
        ctx.beginPath();
        ctx.moveTo(...toScreen(nodes[i].x, nodes[i].y));
        ctx.lineTo(...toScreen(nodes[j].x, nodes[j].y));
        ctx.stroke();
      }

      // Frames — small; white only when active, decaying to dim.
      ctx.fillStyle = color;
      for (const n of nodes) {
        const [sxp, syp] = toScreen(n.x, n.y);
        if (sxp < -6 || sxp > w + 6 || syp < -6 || syp > h + 6) continue;
        ctx.globalAlpha = 0.07 + 0.93 * n.a * n.a;
        ctx.beginPath();
        ctx.arc(sxp, syp, 0.8 + 1.6 * n.a, 0, Math.PI * 2);
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
