"use client";

import { useEffect, useRef } from "react";

// Fractal composition. A continuous zoom into the substrate: every membrane is a
// cluster of frames around a centre, and the centre opens into another membrane
// of frames, the same motif at every scale. The zoom advances one level per
// cycle and wraps, so the nesting appears endless — self-similar across scales.
// Each membrane is an irregular blob (multi-harmonic), not a clean ring, and the
// outermost fades out before it reaches the edge. Black/white, currentColor.
const R = 0.46; // each level is R× the size of its parent
const LEVELS = 7;
const M = 6; // frames per membrane

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Per-level harmonic coefficients so each membrane is its own irregular shape.
const HARM = (() => {
  const rng = mulberry32(99);
  return Array.from({ length: LEVELS }, () =>
    Array.from({ length: 3 }, (_, k) => ({ k: 2 + k + Math.floor(rng() * 2), amp: 0.05 + rng() * 0.07, phase: rng() * Math.PI * 2 })),
  );
})();

const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

export function FractalZoom() {
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
      const cx = w / 2;
      const cy = h / 2;

      const period = 3.0; // quicker zoom
      const phase = (t % period) / period;
      const globalScale = Math.pow(1 / R, phase);
      const base = 0.6 * m;

      const blob = (a: number, i: number, rot: number) => {
        let r = 1;
        for (const hm of HARM[i % HARM.length]) r += hm.amp * Math.sin(hm.k * a + hm.phase + rot * 0.4);
        return r;
      };

      for (let i = 0; i < LEVELS; i++) {
        const scale = base * Math.pow(R, i) * globalScale; // membrane radius (px)
        // Fade in while small, and out well before the edge so the outer blob
        // dissolves rather than clipping off-canvas.
        const op = smooth(scale / (0.07 * m)) * smooth((0.78 * m - scale) / (0.4 * m));
        if (op < 0.02) continue;
        const rot = i * 2.39996 + t * 0.08;

        // Membrane: an irregular closed blob.
        ctx.strokeStyle = color;
        ctx.globalAlpha = op * 0.5;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        const STEPS = 80;
        for (let k = 0; k <= STEPS; k++) {
          const a = (k / STEPS) * Math.PI * 2;
          const rr = scale * blob(a, i, rot);
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;
          if (k) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Frames around the centre, with spokes; the centre holds the next level.
        const nodeR = scale * 0.58;
        for (let j = 0; j < M; j++) {
          const a = rot + (j / M) * Math.PI * 2 + 0.2 * Math.sin(rot + j);
          const nx = cx + Math.cos(a) * nodeR * blob(a, i, rot);
          const ny = cy + Math.sin(a) * nodeR * blob(a, i, rot);
          ctx.globalAlpha = op * 0.26;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.globalAlpha = op * 0.85;
          ctx.beginPath();
          ctx.arc(nx, ny, Math.max(1, 0.01 * scale + 1.1), 0, Math.PI * 2);
          ctx.fill();
        }
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
