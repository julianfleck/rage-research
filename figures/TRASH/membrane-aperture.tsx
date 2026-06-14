"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Intervention surface. A membrane drawn over a field of frames; its size is the
// control. Widen it and it admits more frames — and more frame-types — so the
// variety inside rises, and with it the reasoning room the enclosed agent has.
// Tighten it and the context narrows back down. The same boundary is the
// readout: what the membrane encloses is what the agent has to work with.
// Black/white, currentColor.
const NF = 46;
const TYPES = 6;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic frame layout (seeded — stable across SSR/CSR): positions in a
// disc centred at 0.5, each carrying a type.
const FRAMES = (() => {
  const rng = mulberry32(20260614);
  return Array.from({ length: NF }, () => {
    const r = Math.sqrt(rng()) * 0.46;
    const a = rng() * Math.PI * 2;
    return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r, type: (rng() * TYPES) | 0 };
  });
})();

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
      ctx.rect(cx - s * 0.82, cy - s * 0.82, s * 1.64, s * 1.64);
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
        const ang = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      break;
    default: {
      const tt = s * 0.4;
      ctx.rect(cx - tt, cy - s, tt * 2, s * 2);
      ctx.rect(cx - s, cy - tt, s * 2, tt * 2);
    }
  }
  ctx.fill();
}

function Canvas({ radius }: { radius: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const radRef = useRef(radius);
  useEffect(() => void (radRef.current = radius), [radius]);

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
      const cx = 0.5 * w;
      const cy = 0.5 * h;
      const rad = radRef.current;

      // Membrane contour — a gently breathing circle of radius `rad`.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.25;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      const STEPS = 90;
      for (let i = 0; i <= STEPS; i++) {
        const a = (i / STEPS) * Math.PI * 2;
        const wob = 1 + 0.03 * Math.sin(a * 3 + t) + 0.02 * Math.cos(a * 5 - t * 0.7);
        const rr = rad * m * wob;
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Frames — bright inside the membrane, faint outside.
      const base = 0.018 * m;
      for (const f of FRAMES) {
        const d = Math.hypot(f.x - 0.5, f.y - 0.5);
        ctx.globalAlpha = d <= rad ? 0.9 : 0.17;
        glyph(ctx, f.x * w, f.y * h, base, f.type);
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

export function MembraneAperture() {
  const [radius, setRadius] = useState(0.3);

  // Reasoning room grows with the variety in play: each type contributes toward
  // 1 as it gains members (saturating), so the bar rises both as new types fall
  // inside and as the ones already inside fill out.
  const { frames, types, room } = useMemo(() => {
    const counts = new Array(TYPES).fill(0);
    let frames = 0;
    for (const f of FRAMES) {
      if (Math.hypot(f.x - 0.5, f.y - 0.5) <= radius) {
        counts[f.type]++;
        frames++;
      }
    }
    const types = counts.filter((c) => c > 0).length;
    const room = counts.reduce((a, c) => a + (1 - Math.exp(-c / 1.2)), 0) / TYPES;
    return { frames, types, room };
  }, [radius]);

  return (
    <div className="not-prose">
      <div className="mx-auto aspect-square w-full max-w-[20rem] text-foreground">
        <Canvas radius={radius} />
      </div>

      <div className="mx-auto mt-6 w-full max-w-[24rem]">
        <div className="flex items-baseline justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <span>membrane size</span>
          <span className="tabular-nums text-foreground">{radius.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={0.5}
          step={0.01}
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
          className="mt-2 w-full accent-foreground"
        />

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <div className="flex justify-between">
            <dt>context</dt>
            <dd className="tabular-nums text-foreground">{frames} frames</dd>
          </div>
          <div className="flex justify-between">
            <dt>variety</dt>
            <dd className="tabular-nums text-foreground">
              {types}/{TYPES} types
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <span>reasoning room</span>
            <span className="tabular-nums text-foreground">{Math.round(room * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-border">
            <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${room * 100}%` }} />
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          The membrane&apos;s size sets what it encloses, and what it encloses is what the agent inside has to work with. Widen it and more frames — and more frame-types — fall inside: the variety in play rises, and with it the room to reason and act. Tighten it and the context narrows back down. Modulating the boundary is how you act on the agent without touching it directly; reading the boundary is how its state becomes legible from outside.
        </p>
      </div>
    </div>
  );
}
