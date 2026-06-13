"use client";

import { useEffect, useRef } from "react";

// Hero, version 1 — energy topology. A field of drifting activation sources that
// wax and wane is drawn as layered contour membranes (the foreground); frames
// are faint texture scattered across the substrate, lighting up only where
// activation concentrates. A literal camera zoom breathes in and out. Black and
// white; inherits currentColor.
const GRID = 40;
const LEVELS = [0.22, 0.4, 0.58, 0.78];

export function SubstrateHeroField() {
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

    type Src = { bx: number; by: number; orad: number; ofreq: number; oph: number; afreq: number; aph: number; r: number };
    const srcs: Src[] = Array.from({ length: 8 }, (_, i) => {
      const a = i * 2.399963;
      const r = Math.sqrt((i + 0.5) / 8) * 0.42;
      return {
        bx: 0.5 + Math.cos(a) * r,
        by: 0.5 + Math.sin(a) * r,
        orad: 0.05 + 0.05 * (i % 2),
        ofreq: 0.03 + 0.02 * (i % 3),
        oph: i * 1.1,
        afreq: 0.09 + 0.07 * (i % 3),
        aph: i * 2.1,
        r: 0.1 + 0.03 * (i % 2),
      };
    });

    type Pt = { x: number; y: number; born: number; life: number };
    const pts: Pt[] = Array.from({ length: 80 }, (_, i) => {
      const a = i * 2.399963;
      const rr = Math.sqrt((i + 0.5) / 80) * 0.5;
      const life = rnd(7, 14);
      return { x: 0.5 + Math.cos(a) * rr, y: 0.5 + Math.sin(a) * rr, born: -rnd(0, life), life };
    });
    const respawn = (p: Pt) => {
      const a = rnd(0, Math.PI * 2);
      const rr = rnd(0, 0.5);
      p.x = 0.5 + Math.cos(a) * rr;
      p.y = 0.5 + Math.sin(a) * rr;
      p.born = t;
      p.life = rnd(7, 14);
    };

    const field = new Float32Array((GRID + 1) * (GRID + 1));

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

      const z = 1.4 + 0.4 * Math.sin(t * 0.2);
      const fx = 0.5 + 0.14 * Math.cos(t * 0.045);
      const fy = 0.5 + 0.14 * Math.sin(t * 0.04);
      const toScreen = (wx: number, wy: number): [number, number] => [((wx - fx) * z + 0.5) * w, ((wy - fy) * z + 0.5) * h];

      const sp = srcs.map((s) => ({
        x: s.bx + s.orad * Math.cos(s.oph + t * s.ofreq),
        y: s.by + s.orad * Math.sin(s.oph + t * s.ofreq),
        a: 0.45 + 0.55 * Math.sin(t * s.afreq + s.aph),
        r: s.r,
      }));
      const fieldAt = (x: number, y: number) => {
        let f = 0;
        for (const s of sp) {
          const dx = x - s.x;
          const dy = y - s.y;
          f += s.a * Math.exp(-(dx * dx + dy * dy) / (2 * s.r * s.r));
        }
        return f;
      };

      // Splat the field into the screen grid.
      field.fill(0);
      for (const s of sp) {
        if (s.a < 0.01) continue;
        const sf = ((s.x - fx) * z + 0.5) * GRID;
        const tf = ((s.y - fy) * z + 0.5) * GRID;
        const sg = s.r * z * GRID;
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
            field[gy * (GRID + 1) + gx] += s.a * Math.exp(-(dx * dx + dy * dy) * inv);
          }
        }
      }

      // Membranes — the foreground.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      LEVELS.forEach((lv, li) => {
        ctx.globalAlpha = 0.16 + li * 0.08;
        ctx.beginPath();
        contour(lv);
        ctx.stroke();
      });

      // Frames — faint texture, lighting up where activation concentrates.
      ctx.fillStyle = color;
      for (const p of pts) {
        if (t - p.born >= p.life) respawn(p);
        const age = t - p.born;
        const life = Math.max(0, Math.min(age / 1.0, (p.life - age) / 1.4, 1));
        const act = Math.min(1, fieldAt(p.x, p.y));
        const [sxp, syp] = toScreen(p.x, p.y);
        if (sxp < -8 || sxp > w + 8 || syp < -8 || syp > h + 8) continue;
        ctx.globalAlpha = life * (0.07 + 0.5 * act);
        ctx.beginPath();
        ctx.arc(sxp, syp, 1.1 + 1.3 * act, 0, Math.PI * 2);
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
