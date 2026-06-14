"use client";

import { useEffect, useRef } from "react";

// Fractal composition. A continuous zoom into the substrate: every membrane is a
// ring of frames around a centre, and the centre opens into another membrane of
// frames, the same motif at every scale. The zoom advances by one level per
// cycle and wraps, so the nesting appears endless — self-similar across scales.
// Black/white, currentColor.
const R = 0.46; // each level is R× the size of its parent
const LEVELS = 7;
const M = 6; // frames per membrane

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

      // Zoom grows by a factor of 1/R over one cycle, then wraps — so after a
      // cycle each level looks exactly like its parent did. Seamless.
      const period = 4.2;
      const phase = (t % period) / period;
      const globalScale = Math.pow(1 / R, phase);
      const base = 0.62 * m;

      const sMin = 0.01 * m;
      const sMax = 0.95 * m;
      const fade = 0.5;

      for (let i = 0; i < LEVELS; i++) {
        const scale = base * Math.pow(R, i) * globalScale; // membrane radius (px)
        if (scale < sMin || scale > sMax) continue;
        // Fade in while small (just appearing at centre), out while large.
        const inF = Math.min(1, (scale - sMin) / (base * fade));
        const outF = Math.min(1, (sMax - scale) / (base * fade));
        const op = Math.max(0, Math.min(1, inF) * Math.min(1, outF));
        if (op < 0.02) continue;
        const rot = i * 2.39996 + t * 0.06;

        // Membrane: a gently wobbling ring.
        ctx.strokeStyle = color;
        ctx.globalAlpha = op * 0.5;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        const STEPS = 70;
        for (let k = 0; k <= STEPS; k++) {
          const a = (k / STEPS) * Math.PI * 2;
          const wob = 1 + 0.04 * Math.sin(a * 3 + rot);
          const x = cx + Math.cos(a) * scale * wob;
          const y = cy + Math.sin(a) * scale * wob;
          if (k) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Frames on the ring, with spokes to the centre (which holds the next
        // membrane down).
        const nodeR = scale * 0.6;
        for (let j = 0; j < M; j++) {
          const a = rot + (j / M) * Math.PI * 2;
          const nx = cx + Math.cos(a) * nodeR;
          const ny = cy + Math.sin(a) * nodeR;
          ctx.globalAlpha = op * 0.28;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.globalAlpha = op * 0.85;
          ctx.beginPath();
          ctx.arc(nx, ny, Math.max(1, 0.01 * scale + 1.2), 0, Math.PI * 2);
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
