"use client";

import { useEffect, useRef } from "react";

// Hero — activation spreading over an evolving substrate, three layers kept
// strictly separate:
//   · activation a[i] (fast) — energy injected at a couple of seed frames,
//     flashes white, propagates one hop per frame along edges, decays toward a
//     non-zero floor.
//   · coupling c[edge] (slow, Hebbian) — rises only when BOTH endpoints are
//     co-active, decays otherwise. Forms and resolves over subgraphs.
//   · membrane — a passive contour painted where coupling is dense. It exerts
//     NO force; it does not touch coupling.
// Gravity pulls only along coupled edges, as a spring toward a rest length (not
// toward zero) — so coupled frames settle at a spacing instead of collapsing.
// Coupling must be earned through repeated co-activation, so clusters don't snap
// together on a single injection. Black/white; currentColor. Live-tunable.
const GRID = 36;
const LEVELS = [0.22, 0.45, 0.7];
const N = 74;
const FLOOR = 0.08;
const INJECTORS = 3; // independent injection streams, each on its own random
                     // clock — so injections desync and the substrate never
                     // globally fades between turns.
const PROP = 0.7; // activation passed per hop
const FIRE = 0.4; // activation above which a node propagates
const COUP_THRESH = 0.12; // coupling needed before an edge pulls / is drawn
const REPEL_D = 0.05; // short-range repulsion distance
const HOME_K = 0.003; // gentle anchor to home position

export function SubstrateHeroCoact({
  actDecay = 0.98,
  coupDecay = 0.97,
  coupLearn = 0.033,
  pull = 0.052,
  restLen = 0.065,
  injMin = 0.4,
  injMax = 1.3,
  showMembrane = true,
}: {
  actDecay?: number;
  coupDecay?: number;
  coupLearn?: number;
  pull?: number;
  restLen?: number;
  injMin?: number;
  injMax?: number;
  showMembrane?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const actDecayRef = useRef(actDecay);
  const coupDecayRef = useRef(coupDecay);
  const coupLearnRef = useRef(coupLearn);
  const pullRef = useRef(pull);
  const restLenRef = useRef(restLen);
  const injMinRef = useRef(injMin);
  const injMaxRef = useRef(injMax);
  useEffect(() => void (actDecayRef.current = actDecay), [actDecay]);
  useEffect(() => void (coupDecayRef.current = coupDecay), [coupDecay]);
  useEffect(() => void (coupLearnRef.current = coupLearn), [coupLearn]);
  useEffect(() => void (pullRef.current = pull), [pull]);
  useEffect(() => void (restLenRef.current = restLen), [restLen]);
  useEffect(() => void (injMinRef.current = injMin), [injMin]);
  useEffect(() => void (injMaxRef.current = injMax), [injMax]);

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

    type Node = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; a: number; warm: number };
    const nodes: Node[] = Array.from({ length: N }, (_, i) => {
      const ang = i * 2.399963;
      const r = Math.sqrt((i + 0.5) / N) * 0.5;
      const x = 0.5 + Math.cos(ang) * r;
      const y = 0.5 + Math.sin(ang) * r;
      return { hx: x, hy: y, x, y, vx: 0, vy: 0, a: FLOOR, warm: 0 };
    });

    // 3-nearest coupling graph (potential edges; coupling per edge is dynamic).
    const adj: number[][] = nodes.map(() => []);
    const edges: { i: number; j: number; c: number }[] = [];
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
            edges.push({ i: Math.min(i, j), j: Math.max(i, j), c: 0 });
            adj[i].push(j);
            adj[j].push(i);
          }
        }
      }
    }

    const next = new Float32Array(N);
    const fieldArr = new Float32Array((GRID + 1) * (GRID + 1));
    // Each injector fires a single node, then waits its own random interval —
    // staggered start times so they don't sync up.
    const injectors = Array.from({ length: INJECTORS }, (_, i) => ({ next: (i / INJECTORS) * injMaxRef.current }));

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

      const aD = actDecayRef.current;
      const cD = coupDecayRef.current;
      const cL = coupLearnRef.current;
      const pl = pullRef.current;
      const rest = restLenRef.current;

      const z = 1.12 + 0.1 * Math.sin(t * 0.12);
      const fx = 0.5 + 0.06 * Math.cos(t * 0.04);
      const fy = 0.5 + 0.06 * Math.sin(t * 0.034);
      const toScreen = (wx: number, wy: number): [number, number] => [((wx - fx) * z + 0.5) * w, ((wy - fy) * z + 0.5) * h];

      // Inject at individual seed frames. Each injector keeps its own random
      // interval, so injections desync — the substrate never globally fades.
      const injMin = injMinRef.current;
      const injSpan = Math.max(0, injMaxRef.current - injMin);
      for (const inj of injectors) {
        if (t >= inj.next) {
          nodes[Math.floor(Math.random() * N)].a = 1;
          inj.next = t + injMin + Math.random() * injSpan;
        }
      }

      // Activation: decay toward floor, then propagate one hop along edges.
      for (let i = 0; i < N; i++) next[i] = FLOOR + (nodes[i].a - FLOOR) * aD;
      for (let i = 0; i < N; i++) {
        const ai = nodes[i].a;
        if (ai > FIRE) for (const j of adj[i]) next[j] = Math.max(next[j], ai * PROP);
      }
      for (let i = 0; i < N; i++) nodes[i].a = Math.min(1, Math.max(FLOOR, next[i]));

      // Coupling: Hebbian build on co-activation, decay otherwise.
      for (const e of edges) {
        const co = (nodes[e.i].a - FLOOR) * (nodes[e.j].a - FLOOR);
        e.c = Math.min(1, e.c * cD + cL * co);
      }

      // Per-node warmth = incident coupling (for membrane + faint rendering).
      for (const n of nodes) n.warm = 0;
      for (const e of edges) {
        nodes[e.i].warm += e.c;
        nodes[e.j].warm += e.c;
      }

      // Forces. Gentle home anchor + coupling spring toward a rest length
      // (attract beyond it, repel within) + short-range repulsion. The membrane
      // exerts nothing.
      for (const n of nodes) {
        n.vx += HOME_K * (n.hx - n.x);
        n.vy += HOME_K * (n.hy - n.y);
      }
      for (const e of edges) {
        if (e.c < COUP_THRESH) continue;
        const a = nodes[e.i];
        const b = nodes[e.j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        const ux = dx / d;
        const uy = dy / d;
        const f = pl * e.c * (d - rest); // >0 attract, <0 repel
        a.vx += f * ux;
        a.vy += f * uy;
        b.vx -= f * ux;
        b.vy -= f * uy;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1e-6 || d2 > REPEL_D * REPEL_D) continue;
          const d = Math.sqrt(d2);
          const rep = 0.004 * (1 - d / REPEL_D);
          const ux = dx / d;
          const uy = dy / d;
          a.vx -= rep * ux;
          a.vy -= rep * uy;
          b.vx += rep * ux;
          b.vy += rep * uy;
        }
      }
      for (const n of nodes) {
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Membrane: passive paint over the coupling field (warmth splats).
      fieldArr.fill(0);
      const sg = 0.05 * z * GRID;
      const rad = Math.ceil(3 * sg);
      const inv = 1 / (2 * sg * sg);
      for (const n of nodes) {
        const wgt = Math.min(1, n.warm) * 0.9;
        if (wgt < 0.02) continue;
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
            fieldArr[gy * (GRID + 1) + gx] += wgt * Math.exp(-(ddx * ddx + ddy * ddy) * inv);
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

      // Edges: visible only where coupling has formed; flash when firing.
      for (const e of edges) {
        const fire = Math.max(nodes[e.i].a, nodes[e.j].a) - FLOOR;
        const alpha = 0.72 * e.c + 0.35 * fire;
        if (alpha < 0.04) continue;
        ctx.globalAlpha = Math.min(0.9, alpha);
        ctx.beginPath();
        ctx.moveTo(...toScreen(nodes[e.i].x, nodes[e.i].y));
        ctx.lineTo(...toScreen(nodes[e.j].x, nodes[e.j].y));
        ctx.stroke();
      }

      // Frames: white when firing; coupled frames stay gently present.
      ctx.fillStyle = color;
      for (const n of nodes) {
        const [sxp, syp] = toScreen(n.x, n.y);
        if (sxp < -6 || sxp > w + 6 || syp < -6 || syp > h + 6) continue;
        const warm = Math.min(1, n.warm);
        ctx.globalAlpha = 0.22 + 0.78 * Math.max(n.a * n.a, 0.45 * warm);
        ctx.beginPath();
        ctx.arc(sxp, syp, 0.8 + 1.4 * n.a + 0.5 * warm, 0, Math.PI * 2);
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
