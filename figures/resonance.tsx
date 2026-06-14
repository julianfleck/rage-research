"use client";

import { useEffect, useRef } from "react";

// Resonance as a phase field. Each frame is drawn as a short line at its phase
// angle; coupling pulls neighbours toward the same angle, so coherent regions
// lock into parallel domains — that local alignment is resonance, and locked
// regions brighten and lengthen. Alignment fronts propagate across the field
// (periodic kicks spreading through coupling), and moving the cursor over the
// figure pulls nearby frames into the stroke direction, which then spreads.
// Organic (non-grid) layout. Black/white, currentColor.
const TARGET = 72;
const MIND = 0.072;
const NBR = 0.135;
const K = 0.5;
const STEP = 0.05;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P = { x: number; y: number; omega: number; nbrs: number[] };

// Organic scatter via rejection sampling (blue-noise-ish), not a lattice.
const NODES: P[] = (() => {
  const rng = mulberry32(20260615);
  const pts: P[] = [];
  let tries = 0;
  while (pts.length < TARGET && tries < 6000) {
    tries++;
    const x = 0.05 + rng() * 0.9;
    const y = 0.05 + rng() * 0.9;
    if (pts.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 > MIND * MIND)) {
      const omega = 0.22 + 0.18 * Math.sin(x * 4.2 + 1) * Math.cos(y * 3.6) + (rng() - 0.5) * 0.05;
      pts.push({ x, y, omega, nbrs: [] });
    }
  }
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if ((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2 < NBR * NBR) {
        pts[i].nbrs.push(j);
        pts[j].nbrs.push(i);
      }
    }
  }
  return pts;
})();

const THETA0 = (() => {
  const rng = mulberry32(7);
  return NODES.map(() => rng() * Math.PI * 2);
})();

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

    const theta = THETA0.slice();
    const next = new Float32Array(theta.length);

    // Cursor drive (works through pointer-events:none via a window listener).
    let mx = 0;
    let my = 0;
    let mAng = 0;
    let mStr = 0;
    let mLast = -10;
    let pmx = 0;
    let pmy = 0;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      const dx = x - pmx;
      const dy = y - pmy;
      const mag = Math.hypot(dx, dy);
      if (mag > 0.001) mAng = Math.atan2(dy, dx);
      mStr = Math.min(1, mag * 9);
      mx = x;
      my = y;
      pmx = x;
      pmy = y;
      mLast = t;
    };
    window.addEventListener("mousemove", onMove);

    // Ambient alignment fronts: every so often, snap one frame to a new angle and
    // let coupling carry the realignment outward.
    let nextKick = 1.0;

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

      // Periodic kick — seeds a propagating front.
      if (t >= nextKick) {
        const i = Math.floor(((t * 97.3) % 1) * NODES.length) % NODES.length;
        theta[i] = (t * 2.4) % (Math.PI * 2);
        nextKick = t + 1.5;
      }

      const cursorOn = t - mLast < 0.2 && mStr > 0.02;

      // Kuramoto step + cursor drive toward the stroke direction.
      for (let i = 0; i < NODES.length; i++) {
        let s = 0;
        for (const j of NODES[i].nbrs) s += Math.sin(theta[j] - theta[i]);
        let d = NODES[i].omega + (K * s) / Math.max(1, NODES[i].nbrs.length);
        if (cursorOn) {
          const dist = Math.hypot(NODES[i].x - mx, NODES[i].y - my);
          if (dist < 0.24) {
            const prox = 1 - dist / 0.24;
            d += 1.6 * prox * mStr * Math.sin(mAng - theta[i]);
          }
        }
        next[i] = theta[i] + STEP * d;
      }
      for (let i = 0; i < theta.length; i++) theta[i] = next[i];

      // Local alignment per frame (over itself + neighbours).
      const order = new Float32Array(theta.length);
      for (let i = 0; i < NODES.length; i++) {
        let cxv = Math.cos(theta[i]);
        let cyv = Math.sin(theta[i]);
        for (const j of NODES[i].nbrs) {
          cxv += Math.cos(theta[j]);
          cyv += Math.sin(theta[j]);
        }
        order[i] = Math.hypot(cxv, cyv) / (1 + NODES[i].nbrs.length);
      }

      // Faint links between aligned neighbours — the field knitting together.
      ctx.strokeStyle = color;
      for (let i = 0; i < NODES.length; i++) {
        for (const j of NODES[i].nbrs) {
          if (j < i) continue;
          const coh = 0.5 + 0.5 * Math.cos(theta[i] - theta[j]);
          if (coh < 0.62) continue;
          ctx.globalAlpha = 0.12 * (coh - 0.62) * 2.6;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(NODES[i].x * w, NODES[i].y * h);
          ctx.lineTo(NODES[j].x * w, NODES[j].y * h);
          ctx.stroke();
        }
      }

      // Phase-angle ticks: brighter and longer where the region has locked.
      ctx.lineCap = "round";
      for (let i = 0; i < NODES.length; i++) {
        const o = order[i];
        const hl = (0.016 + 0.016 * o) * m;
        const px = NODES[i].x * w;
        const py = NODES[i].y * h;
        const dx = Math.cos(theta[i]) * hl;
        const dy = Math.sin(theta[i]) * hl;
        ctx.globalAlpha = 0.22 + 0.7 * o;
        ctx.lineWidth = 1 + 1.4 * o;
        ctx.beginPath();
        ctx.moveTo(px - dx, py - dy);
        ctx.lineTo(px + dx, py + dy);
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
