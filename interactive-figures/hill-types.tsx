"use client";

import { useEffect, useRef } from "react";

// Frame-type diversity over a subgraph. Nodes are frames, each drawn as a glyph
// for its type (circle, triangle, square, diamond, star, plus); edges make it
// read as a piece of the graph. The mix animates between varied (many shapes)
// and collapsed (most frames the same shape), and the three Hill numbers —
// richness ⁰D, Shannon ¹D, inverse-Simpson ²D — are read live off the mix, so
// the gap between the orders opens and closes as diversity changes.
// Black and white; colour inherits from currentColor.
const DOMINANT = 0;
const N = 16;

const BASE: [number, number][] = Array.from({ length: N }, (_, i) => {
  const a = i * 2.399963;
  const r = Math.sqrt((i + 0.5) / N) * 0.34;
  return [0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r];
});
const TYPES = [0, 1, 2, 3, 4, 5, 0, 2, 4, 1, 3, 5, 2, 0, 4, 3];
const THR = Array.from({ length: N }, (_, i) => (((i * 9 + 4) % N) / N) * 0.84 + 0.08);

// Connect each node to its two nearest neighbours → an organic connected subgraph.
const EDGES: [number, number][] = (() => {
  const set = new Set<string>();
  for (let i = 0; i < N; i++) {
    const near = [...Array(N).keys()]
      .filter((j) => j !== i)
      .sort((a, b) => {
        const da = (BASE[i][0] - BASE[a][0]) ** 2 + (BASE[i][1] - BASE[a][1]) ** 2;
        const db = (BASE[i][0] - BASE[b][0]) ** 2 + (BASE[i][1] - BASE[b][1]) ** 2;
        return da - db;
      });
    for (let k = 0; k < 2; k++) {
      const j = near[k];
      set.add(i < j ? `${i}-${j}` : `${j}-${i}`);
    }
  }
  return [...set].map((s) => s.split("-").map(Number) as [number, number]);
})();

const smooth = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

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
      ctx.rect(cx - s * 0.86, cy - s * 0.86, s * 1.72, s * 1.72);
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
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      break;
    default: {
      const t = s * 0.4;
      ctx.rect(cx - t, cy - s, t * 2, s * 2);
      ctx.rect(cx - s, cy - t, s * 2, t * 2);
    }
  }
  ctx.fill();
}

export function HillTypes() {
  const ref = useRef<HTMLCanvasElement>(null);
  const d0 = useRef<HTMLSpanElement>(null);
  const d1 = useRef<HTMLSpanElement>(null);
  const d2 = useRef<HTMLSpanElement>(null);

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

    // Node position with a gentle drift so the graph feels alive, not pinned.
    const pos = (i: number) => ({
      x: (BASE[i][0] + Math.sin(t * 0.5 + i) * 0.012) * w,
      y: (BASE[i][1] + Math.cos(t * 0.45 + i * 1.3) * 0.012) * h,
    });

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);

      const c = 0.5 - 0.5 * Math.cos(t * 0.3); // 0 = diverse, 1 = collapsed
      const base = 0.019 * Math.min(w, h);
      const freq = new Array(6).fill(0);

      // Edges.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.28;
      for (const [a, b] of EDGES) {
        const pa = pos(a);
        const pb = pos(b);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Nodes (typed glyphs, crossfading toward the dominant shape on collapse).
      ctx.fillStyle = color;
      for (let i = 0; i < N; i++) {
        const f = smooth((c - (THR[i] - 0.08)) / 0.16);
        const p = pos(i);
        if (1 - f > 0.03) {
          ctx.globalAlpha = 0.9 * (1 - f);
          glyph(ctx, p.x, p.y, base * (1 - f), TYPES[i]);
        }
        if (f > 0.03) {
          ctx.globalAlpha = 0.9 * f;
          glyph(ctx, p.x, p.y, base * f, DOMINANT);
        }
        freq[TYPES[i]] += 1 - f;
        freq[DOMINANT] += f;
      }
      ctx.globalAlpha = 1;

      // Hill numbers from the live mix.
      const ps = freq.map((v) => v / N).filter((x) => x > 1e-4);
      let H = 0;
      let simp = 0;
      for (const x of ps) {
        H -= x * Math.log(x);
        simp += x * x;
      }
      if (d0.current) d0.current.textContent = `${Math.round(ps.length)}`;
      if (d1.current) d1.current.textContent = `${Math.exp(H).toFixed(1)}`;
      if (d2.current) d2.current.textContent = `${(1 / simp).toFixed(1)}`;

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

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="block h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute left-0 top-0 grid grid-cols-[auto_auto] gap-x-2 gap-y-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>⁰D</span>
        <span ref={d0} className="tabular-nums text-foreground" />
        <span>¹D</span>
        <span ref={d1} className="tabular-nums text-foreground" />
        <span>²D</span>
        <span ref={d2} className="tabular-nums text-foreground" />
      </div>
    </div>
  );
}
