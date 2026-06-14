"use client";

import { useEffect, useRef } from "react";

// Resonance as a field. Two or three sources each impose an orientation on the
// frames around them; the angle at each point is the blend of those influences.
// Where one source dominates, the frames line up into a domain; where two reach
// the same region, their orientations interfere and the field twists. The sources
// turn slowly, so the domains and interference bands drift across the field. The
// cursor acts as a strong moving source — drag over it and the frames comb into
// the stroke direction. Black/white, currentColor.
const COLS = 16;
const SOFT = 0.02; // softening so a source's pull stays finite at its centre
const MOUSE_W = 1.4; // cursor source strength

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Slightly jittered grid of sample points, clipped to a disc so the field reads
// as a circle rather than a square.
const PTS: [number, number][] = (() => {
  const rng = mulberry32(20260615);
  const cell = 1 / COLS;
  const out: [number, number][] = [];
  for (let r = 0; r < COLS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = (c + 0.5) * cell + (rng() - 0.5) * cell * 0.5;
      const y = (r + 0.5) * cell + (rng() - 0.5) * cell * 0.5;
      if ((x - 0.5) ** 2 + (y - 0.5) ** 2 <= 0.46 * 0.46) out.push([x, y]);
    }
  }
  return out;
})();

const SOURCES = [
  { x: 0.27, y: 0.3, ang: 0.4, rate: 0.05 },
  { x: 0.74, y: 0.38, ang: 1.9, rate: -0.037 },
  { x: 0.48, y: 0.76, ang: 2.7, rate: 0.028 },
];

export function ResonanceFigure() {
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

    let mx = 0;
    let my = 0;
    let mAng = 0;
    let pmx = 0;
    let pmy = 0;
    let mInside = false;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        mInside = false;
        return;
      }
      mInside = true;
      const dx = x - pmx;
      const dy = y - pmy;
      if (Math.hypot(dx, dy) > 0.001) {
        // Smooth the stroke angle so direction changes don't jitter.
        const a = Math.atan2(dy, dx);
        mAng = Math.atan2(0.6 * Math.sin(mAng) + 0.4 * Math.sin(a), 0.6 * Math.cos(mAng) + 0.4 * Math.cos(a));
      }
      mx = x;
      my = y;
      pmx = x;
      pmy = y;
    };
    window.addEventListener("mousemove", onMove);

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

      // Active pointer: the real cursor while it's over the figure, otherwise a
      // virtual one that roams the field on its own — so there's always movement.
      const hovering = mInside;
      let px: number;
      let py: number;
      let pAng: number;
      let pPull: number;
      if (hovering) {
        px = mx;
        py = my;
        pAng = mAng;
        pPull = 0.9;
      } else {
        px = 0.5 + 0.4 * Math.sin(t * 0.9);
        py = 0.5 + 0.36 * Math.sin(t * 1.2 + 1.3);
        pAng = Math.atan2(0.36 * 1.2 * Math.cos(t * 1.2 + 1.3), 0.4 * 0.9 * Math.cos(t * 0.9));
        pPull = 0.7;
      }

      // Current source orientations (slowly turning).
      const sa = SOURCES.map((s) => 2 * (s.ang + s.rate * t));

      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      const PR = 0.4; // pointer influence radius (for the width highlight)
      for (const [x, y] of PTS) {
        let vx = 0;
        let vy = 0;
        let wsum = 0;
        for (let s = 0; s < SOURCES.length; s++) {
          const d2 = (x - SOURCES[s].x) ** 2 + (y - SOURCES[s].y) ** 2;
          const wt = 1 / (d2 + SOFT);
          vx += wt * Math.cos(sa[s]);
          vy += wt * Math.sin(sa[s]);
          wsum += wt;
        }
        // The pointer combs the field toward its stroke direction.
        const pd2 = (x - px) ** 2 + (y - py) ** 2;
        const pw = (pPull * MOUSE_W) / (pd2 + 0.03);
        vx += pw * Math.cos(2 * pAng);
        vy += pw * Math.sin(2 * pAng);
        wsum += pw;

        const angle = 0.5 * Math.atan2(vy, vx);
        const coh = wsum > 0 ? Math.hypot(vx, vy) / wsum : 0; // 1 = aligned, low = interference
        const hl = (0.013 + 0.007 * coh) * m;
        const dx = Math.cos(angle) * hl;
        const dy = Math.sin(angle) * hl;
        // Width grows only under the real cursor; thin everywhere else.
        const prox = hovering ? Math.max(0, 1 - Math.sqrt(pd2) / PR) : 0;
        ctx.globalAlpha = 0.2 + 0.6 * coh;
        ctx.lineWidth = 0.6 + 2.4 * prox;
        ctx.beginPath();
        ctx.moveTo(x * w - dx, y * h - dy);
        ctx.lineTo(x * w + dx, y * h + dy);
        ctx.stroke();
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
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="block h-full w-full" aria-hidden />;
}
