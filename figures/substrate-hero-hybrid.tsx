"use client";

import { useEffect, useRef } from "react";

// Hero, hybrid — v3's progressive-zoom graph (clusters of hubs + write-back
// leaves that fold into the hub when zoomed out and unfold when zoomed in, with
// activation shown by opacity and contour membranes summed from the activated
// nodes) over v1's atmosphere: a faint field of substrate frames as texture that
// lights up where activation concentrates. The camera zoom is more dynamic
// (two cadences). Black and white; inherits currentColor.
const GRID = 36;
const LEVELS = [0.25, 0.45, 0.65, 0.85];
const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

export function SubstrateHeroHybrid() {
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
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const NC = 11;
    type Cl = { bx: number; by: number; orad: number; ofreq: number; oph: number; afreq: number; aph: number };
    const clusters: Cl[] = Array.from({ length: NC }, (_, i) => {
      const a = i * 2.399963;
      const r = Math.sqrt((i + 0.5) / NC) * 0.46;
      return {
        bx: 0.5 + Math.cos(a) * r,
        by: 0.5 + Math.sin(a) * r,
        orad: 0.04 + 0.03 * (i % 3),
        ofreq: 0.03 + 0.02 * (i % 2),
        oph: i * 1.1,
        afreq: 0.1 + 0.08 * (i % 3),
        aph: i * 2.1,
      };
    });

    type Leaf = { c: number; ox: number; oy: number; born: number; life: number };
    const leaves: Leaf[] = [];
    clusters.forEach((_, c) => {
      const n = 6 + (c % 4);
      for (let j = 0; j < n; j++) {
        const a = (j / n) * Math.PI * 2;
        const r = rnd(0.04, 0.09);
        leaves.push({ c, ox: Math.cos(a) * r, oy: Math.sin(a) * r, born: -rnd(0, 9), life: rnd(8, 15) });
      }
    });
    const respawnLeaf = (l: Leaf) => {
      const a = rnd(0, Math.PI * 2);
      const r = rnd(0.04, 0.09);
      l.ox = Math.cos(a) * r;
      l.oy = Math.sin(a) * r;
      l.born = t;
      l.life = rnd(8, 15);
    };

    // Atmospheric substrate texture: faint frames scattered everywhere.
    type Tex = { x: number; y: number; born: number; life: number };
    const tex: Tex[] = Array.from({ length: 70 }, (_, i) => {
      const a = i * 2.399963;
      const rr = Math.sqrt((i + 0.5) / 70) * 0.52;
      const life = rnd(7, 14);
      return { x: 0.5 + Math.cos(a) * rr, y: 0.5 + Math.sin(a) * rr, born: -rnd(0, life), life };
    });
    const respawnTex = (p: Tex) => {
      const a = rnd(0, Math.PI * 2);
      const rr = rnd(0, 0.52);
      p.x = 0.5 + Math.cos(a) * rr;
      p.y = 0.5 + Math.sin(a) * rr;
      p.born = t;
      p.life = rnd(7, 14);
    };

    const LINKS: [number, number][] = [];
    {
      const seen = new Set<string>();
      clusters.forEach((c, i) => {
        let best = -1;
        let bd = Infinity;
        clusters.forEach((o, j) => {
          if (j === i) return;
          const d = (c.bx - o.bx) ** 2 + (c.by - o.by) ** 2;
          if (d < bd) {
            bd = d;
            best = j;
          }
        });
        const key = i < best ? `${i}-${best}` : `${best}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          LINKS.push([Math.min(i, best), Math.max(i, best)]);
        }
      });
    }

    const field = new Float32Array((GRID + 1) * (GRID + 1));
    const cPos: [number, number][] = clusters.map(() => [0, 0]);
    const cAct: number[] = clusters.map(() => 0);
    const lPos: [number, number][] = leaves.map(() => [0, 0]);
    const lOp: number[] = leaves.map(() => 0);

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
      const at = (gx: number, gy: number) => field[gy * (GRID + 1) + gx];
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

      // More dynamic zoom: two cadences combined.
      const z = 1.5 + 0.26 * Math.sin(t * 0.3) + 0.08 * Math.sin(t * 0.16 + 1);
      const fx = 0.5 + 0.13 * Math.cos(t * 0.05);
      const fy = 0.5 + 0.13 * Math.sin(t * 0.043);
      const toScreen = (wx: number, wy: number): [number, number] => [((wx - fx) * z + 0.5) * w, ((wy - fy) * z + 0.5) * h];

      const e = smooth((z - 1.3) / 0.35);
      clusters.forEach((c, i) => {
        cPos[i][0] = c.bx + c.orad * Math.cos(c.oph + t * c.ofreq);
        cPos[i][1] = c.by + c.orad * Math.sin(c.oph + t * c.ofreq);
        cAct[i] = 0.5 + 0.5 * Math.sin(t * c.afreq + c.aph);
      });
      for (let i = 0; i < leaves.length; i++) {
        const l = leaves[i];
        if (t - l.born >= l.life) respawnLeaf(l);
        const age = t - l.born;
        const life = Math.max(0, Math.min(age / 1.0, (l.life - age) / 1.4, 1));
        lOp[i] = life * cAct[l.c] * e;
        lPos[i][0] = cPos[l.c][0] + l.ox * e;
        lPos[i][1] = cPos[l.c][1] + l.oy * e;
      }

      field.fill(0);
      const splat = (wx: number, wy: number, weight: number, sigWorld: number) => {
        if (weight < 0.01) return;
        const sf = ((wx - fx) * z + 0.5) * GRID;
        const tf = ((wy - fy) * z + 0.5) * GRID;
        const sg = sigWorld * z * GRID;
        if (sg < 0.25) return;
        const rad = Math.ceil(3 * sg);
        const gx0 = Math.max(0, Math.floor(sf - rad));
        const gx1 = Math.min(GRID, Math.ceil(sf + rad));
        const gy0 = Math.max(0, Math.floor(tf - rad));
        const gy1 = Math.min(GRID, Math.ceil(tf + rad));
        const inv = 1 / (2 * sg * sg);
        for (let gy = gy0; gy <= gy1; gy++) {
          for (let gx = gx0; gx <= gx1; gx++) {
            const dx = gx - sf;
            const dy = gy - tf;
            field[gy * (GRID + 1) + gx] += weight * Math.exp(-(dx * dx + dy * dy) * inv);
          }
        }
      };
      for (let i = 0; i < clusters.length; i++) splat(cPos[i][0], cPos[i][1], cAct[i] * 1.0, 0.1);
      for (let i = 0; i < leaves.length; i++) splat(lPos[i][0], lPos[i][1], lOp[i] * 0.5, 0.06);

      // Sample the field (screen-grid, bilinear) for texture brightness.
      const sample = (wx: number, wy: number) => {
        const gxf = ((wx - fx) * z + 0.5) * GRID;
        const gyf = ((wy - fy) * z + 0.5) * GRID;
        if (gxf < 0 || gxf >= GRID || gyf < 0 || gyf >= GRID) return 0;
        const gx = Math.floor(gxf);
        const gy = Math.floor(gyf);
        const tx = gxf - gx;
        const ty = gyf - gy;
        const i00 = field[gy * (GRID + 1) + gx];
        const i10 = field[gy * (GRID + 1) + gx + 1];
        const i01 = field[(gy + 1) * (GRID + 1) + gx];
        const i11 = field[(gy + 1) * (GRID + 1) + gx + 1];
        return (i00 * (1 - tx) + i10 * tx) * (1 - ty) + (i01 * (1 - tx) + i11 * tx) * ty;
      };

      // Membranes.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      LEVELS.forEach((lv, li) => {
        ctx.globalAlpha = 0.14 + li * 0.08;
        ctx.beginPath();
        contour(lv);
        ctx.stroke();
      });

      // Atmospheric texture (behind the structure).
      ctx.fillStyle = color;
      for (const p of tex) {
        if (t - p.born >= p.life) respawnTex(p);
        const age = t - p.born;
        const life = Math.max(0, Math.min(age / 1.0, (p.life - age) / 1.4, 1));
        const act = Math.min(1, sample(p.x, p.y));
        const [sxp, syp] = toScreen(p.x, p.y);
        if (sxp < -8 || sxp > w + 8 || syp < -8 || syp > h + 8) continue;
        ctx.globalAlpha = life * (0.05 + 0.4 * act);
        ctx.beginPath();
        ctx.arc(sxp, syp, 1 + 1.1 * act, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inter-cluster links.
      for (const [a, bk] of LINKS) {
        const op = 0.1 * Math.min(cAct[a], cAct[bk]) + 0.03;
        const pa = toScreen(cPos[a][0], cPos[a][1]);
        const pb = toScreen(cPos[bk][0], cPos[bk][1]);
        ctx.globalAlpha = op;
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
      }

      // Hub → leaf edges.
      for (let i = 0; i < leaves.length; i++) {
        if (lOp[i] <= 0.02) continue;
        const a = toScreen(cPos[leaves[i].c][0], cPos[leaves[i].c][1]);
        const bb = toScreen(lPos[i][0], lPos[i][1]);
        ctx.globalAlpha = 0.26 * lOp[i];
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(bb[0], bb[1]);
        ctx.stroke();
      }

      // Structure nodes — opacity carries activation.
      for (let i = 0; i < clusters.length; i++) {
        const [sxp, syp] = toScreen(cPos[i][0], cPos[i][1]);
        if (sxp < -8 || sxp > w + 8 || syp < -8 || syp > h + 8) continue;
        ctx.globalAlpha = 0.25 + 0.6 * cAct[i];
        ctx.beginPath();
        ctx.arc(sxp, syp, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < leaves.length; i++) {
        if (lOp[i] <= 0.02) continue;
        const [sxp, syp] = toScreen(lPos[i][0], lPos[i][1]);
        if (sxp < -8 || sxp > w + 8 || syp < -8 || syp > h + 8) continue;
        ctx.globalAlpha = 0.2 + 0.65 * lOp[i];
        ctx.beginPath();
        ctx.arc(sxp, syp, 1.7, 0, Math.PI * 2);
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
