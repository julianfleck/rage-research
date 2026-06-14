"use client";

import { useEffect, useRef } from "react";

// Semipermeable channels. A membrane runs down the middle; particles drift in
// from the left and pile against it. Each channel has its own threshold — it
// opens only once enough has accumulated on its side, lets a burst cross, then
// closes again as the pressure relieves and decays. The point is conditional
// flow: nothing crosses a shut channel, everything waits on the threshold.
// Black/white, currentColor.
const CH = 4; // channels down the membrane
const N = 80; // particles
const MX = 0.5; // membrane x (normalized)

export function MembraneChannels() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;
    let frame = 0;
    let color = "#888";
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const halfBand = (0.5 / CH) * 0.5; // vertical reach of a channel's band
    // Channels evenly spaced down the membrane, each with its own threshold.
    const channels = Array.from({ length: CH }, (_, i) => ({
      y: (i + 0.5) / CH,
      th: rnd(0.45, 0.85), // pressure needed to open
      p: rnd(0, 0.3), // accumulated pressure
      o: 0, // openness 0..1
    }));

    const nearest = (y: number) => {
      let best = 0;
      let bd = 1e9;
      for (let i = 0; i < CH; i++) {
        const d = Math.abs(channels[i].y - y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    };

    type P = { x: number; y: number; ch: number; crossed: boolean };
    const spawn = (): P => {
      const y = rnd(0.06, 0.94);
      return { x: rnd(-0.15, 0.34), y, ch: nearest(y), crossed: false };
    };
    const parts: P[] = Array.from({ length: N }, spawn);

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
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);

      // Pressure & openness per channel: pressure leaks slowly, opens once it
      // crosses the threshold, and drains faster while open.
      for (const c of channels) {
        c.p *= 0.992;
        const target = c.p > c.th ? 1 : 0;
        c.o += (target - c.o) * 0.12;
        if (c.o > 0.6) c.p *= 0.94;
      }

      // Particles: drift toward the membrane, pile against it adding pressure,
      // slip through only where a channel is open near their band.
      for (const pt of parts) {
        if (!pt.crossed) {
          pt.x += 0.0016;
          const c = channels[pt.ch];
          if (pt.x > 0.3) pt.y += (c.y - pt.y) * 0.04; // steer toward its channel
          if (pt.x >= MX - 0.012) {
            if (c.o > 0.55 && Math.abs(pt.y - c.y) < halfBand) {
              pt.crossed = true; // slip through the open channel
            } else {
              pt.x = MX - 0.012; // blocked: hold against the wall
              c.p += 0.0009; // ...and press on it
            }
          }
        } else {
          pt.x += 0.004; // released, streams right
          if (pt.x > 1.12) Object.assign(pt, spawn()); // recycle from the left
        }
      }

      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Membrane wall, with a gap at each channel (gap height grows as it opens).
      const opening = (c: (typeof channels)[number]) => halfBand * (0.32 + 0.68 * c.o);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      let cy = 0;
      for (const c of channels) {
        const g = opening(c);
        if (c.y - g > cy) {
          ctx.moveTo(sx(MX), sy(cy));
          ctx.lineTo(sx(MX), sy(c.y - g));
        }
        cy = c.y + g;
      }
      if (cy < 1) {
        ctx.moveTo(sx(MX), sy(cy));
        ctx.lineTo(sx(MX), sy(1));
      }
      ctx.stroke();

      // Channel brackets: brighten and widen as they open.
      for (const c of channels) {
        const g = opening(c);
        const bx = 5;
        ctx.globalAlpha = 0.3 + 0.7 * c.o;
        ctx.lineWidth = 1 + 1.5 * c.o;
        ctx.beginPath();
        ctx.moveTo(sx(MX) - bx, sy(c.y - g));
        ctx.lineTo(sx(MX) + bx, sy(c.y - g));
        ctx.moveTo(sx(MX) - bx, sy(c.y + g));
        ctx.lineTo(sx(MX) + bx, sy(c.y + g));
        ctx.stroke();
      }

      // Particles: faint in transit, brighter when pressed against the wall.
      ctx.fillStyle = color;
      for (const pt of parts) {
        const blocked = !pt.crossed && pt.x >= MX - 0.02;
        ctx.globalAlpha = pt.crossed ? 0.5 : blocked ? 0.85 : 0.4;
        ctx.beginPath();
        ctx.arc(sx(pt.x), sy(pt.y), blocked ? 1.8 : 1.4, 0, Math.PI * 2);
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

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="block h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>accumulation</span>
        <span>flow</span>
      </div>
    </div>
  );
}
