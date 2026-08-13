"use client";

import { useEffect, useRef } from "react";

// A loose field of frames whose activation gathers toward a slowly drifting
// focus and disperses again — the spatial picture of the concentration the Gini
// coefficient summarizes. Black and white; colour inherits from currentColor.
export function SubstrateField() {
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

    // Stable layout: a golden-angle spiral gives an even-ish scatter.
    const N = 22;
    const nodes = Array.from({ length: N }, (_, i) => {
      const a = i * 2.399963;
      const r = Math.sqrt((i + 0.5) / N) * 0.42;
      return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r, base: 0.35 + ((i * 7) % 5) / 12 };
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
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

      const conc = 0.5 + 0.5 * Math.sin(t * 0.5); // 0 = spread, 1 = concentrated
      const fx = 0.5 + 0.28 * Math.cos(t * 0.27); // drifting focus
      const fy = 0.5 + 0.28 * Math.sin(t * 0.21);
      const spread = 0.045;

      // Faint couplings between nearby frames.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 0.03) {
            ctx.globalAlpha = 0.3 * (1 - d2 / 0.03);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
            ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
            ctx.stroke();
          }
        }
      }

      // Frames: radius and opacity track activation.
      ctx.fillStyle = color;
      for (const n of nodes) {
        const dx = n.x - fx;
        const dy = n.y - fy;
        const peak = Math.exp(-(dx * dx + dy * dy) / spread);
        const act = Math.max(0.05, Math.min(1, n.base * (1 - conc) + peak * conc * 1.5));
        ctx.globalAlpha = 0.2 + act * 0.6;
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, 1.5 + act * 7, 0, Math.PI * 2);
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
