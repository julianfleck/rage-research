"use client";

import { useEffect, useRef } from "react";

// A 2D slice of the substrate ecosystem. The substrate is a band of frames along
// the bottom; agents hover above it and, turn by turn, reach down and pull a
// frame up into their working context. The pulled frame lights, rises along the
// tether, then settles back. Successive turns pull different frames from
// different agents. Black/white, currentColor.
const NF = 26; // frames along the substrate
const NA = 4; // hovering agents
const BASE = 0.8; // substrate surface height

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FRAMES = (() => {
  const rng = mulberry32(20260615);
  return Array.from({ length: NF }, (_, i) => ({ x: (i + 0.5) / NF, jx: (rng() - 0.5) * 0.01, a: 0 }));
})();

export function SubstrateSlice() {
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
    const rng = mulberry32(7);

    const surfaceY = (x: number, t: number) => BASE + 0.015 * Math.sin(x * 7 + t * 0.3);

    type Agent = { x: number; ph: number; next: number; pull: { fi: number; t0: number } | null };
    const agents: Agent[] = Array.from({ length: NA }, (_, i) => ({
      x: 0.14 + (i / (NA - 1)) * 0.72,
      ph: rng() * 6.28,
      next: 0.4 + rng() * 1.2,
      pull: null,
    }));
    type Traveler = { fi: number; ax: number; ay: number; p: number };
    const travelers: Traveler[] = [];

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
      const t = frame * 0.01;
      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Agent positions (hovering + bobbing).
      const agentY = (a: Agent) => 0.26 + 0.02 * Math.sin(t * 1.6 + a.ph);

      // Each agent pulls a nearby frame on its own clock.
      for (const a of agents) {
        if (t >= a.next) {
          // pick a frame near the agent's x
          let best = 0;
          let bd = 1e9;
          for (let i = 0; i < NF; i++) {
            const d = Math.abs(FRAMES[i].x + FRAMES[i].jx - a.x) + rng() * 0.15;
            if (d < bd) {
              bd = d;
              best = i;
            }
          }
          a.pull = { fi: best, t0: t };
          FRAMES[best].a = 1;
          travelers.push({ fi: best, ax: a.x, ay: agentY(a), p: 0 });
          a.next = t + 1.0 + rng() * 1.6;
        }
        if (a.pull && t - a.pull.t0 > 0.9) a.pull = null;
      }

      for (const f of FRAMES) f.a *= 0.96;

      // Substrate surface.
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const x = i / 60;
        if (i) ctx.lineTo(sx(x), sy(surfaceY(x, t)));
        else ctx.moveTo(sx(x), sy(surfaceY(x, t)));
      }
      ctx.stroke();

      // Tethers from agents to the frames they're pulling.
      for (const a of agents) {
        if (!a.pull) continue;
        const f = FRAMES[a.pull.fi];
        const fx = f.x + f.jx;
        ctx.globalAlpha = 0.35 * f.a;
        ctx.beginPath();
        ctx.moveTo(sx(a.x), sy(agentY(a) + 0.02));
        ctx.lineTo(sx(fx), sy(surfaceY(fx, t)));
        ctx.stroke();
      }

      // Frames sitting in the substrate (brighter when freshly pulled).
      ctx.fillStyle = color;
      for (const f of FRAMES) {
        const fx = f.x + f.jx;
        ctx.globalAlpha = 0.3 + 0.65 * f.a;
        ctx.beginPath();
        ctx.arc(sx(fx), sy(surfaceY(fx, t)), 1.5 + 1.2 * f.a, 0, Math.PI * 2);
        ctx.fill();
      }

      // Travelers: pulled frames rising along the tether toward the agent.
      for (let i = travelers.length - 1; i >= 0; i--) {
        const tr = travelers[i];
        tr.p += 0.03;
        if (tr.p >= 1) {
          travelers.splice(i, 1);
          continue;
        }
        const f = FRAMES[tr.fi];
        const fx = f.x + f.jx;
        const x = fx + (tr.ax - fx) * tr.p;
        const y = surfaceY(fx, t) + (tr.ay + 0.03 - surfaceY(fx, t)) * tr.p;
        ctx.globalAlpha = 0.8 * (1 - tr.p);
        ctx.beginPath();
        ctx.arc(sx(x), sy(y), 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Agents hovering above the substrate (open markers).
      ctx.lineWidth = 1.25;
      for (const a of agents) {
        const ax = sx(a.x);
        const ay = sy(agentY(a));
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(ax, ay, 1, 0, Math.PI * 2);
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
