"use client";

import { useEffect, useRef } from "react";

// A slice of the substrate ecosystem. Frames sit in a band along the bottom,
// lightly wired into a graph; agents hover above. Each turn an agent retrieves —
// it strikes a chord: a connected configuration of frames lights up together and
// is tethered up to the agent. The next turn strikes a different chord, pulling a
// different subgraph. Black/white, currentColor.
const NF = 22;
const NA = 3;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic substrate: frames in a band, wired to nearest neighbours.
const { frames: FR, adj: ADJ } = (() => {
  const rng = mulberry32(20260615);
  const frames = Array.from({ length: NF }, (_, i) => ({
    x: 0.06 + ((i + 0.5) / NF) * 0.88 + (rng() - 0.5) * 0.02,
    y: 0.68 + rng() * 0.24,
  }));
  const adj: number[][] = frames.map(() => []);
  const seen = new Set<string>();
  for (let i = 0; i < NF; i++) {
    const order = [...Array(NF).keys()]
      .filter((j) => j !== i)
      .sort((p, q) => (frames[i].x - frames[p].x) ** 2 + (frames[i].y - frames[p].y) ** 2 - ((frames[i].x - frames[q].x) ** 2 + (frames[i].y - frames[q].y) ** 2));
    for (let k = 0; k < 3; k++) {
      const j = order[k];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }
  return { frames, adj };
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

    const act = new Float32Array(NF);
    type Agent = { x: number; ph: number; next: number; chord: number[] };
    const agents: Agent[] = Array.from({ length: NA }, (_, i) => ({
      x: 0.18 + (i / (NA - 1)) * 0.64,
      ph: rng() * 6.28,
      next: 0.3 + i * 0.5 + rng() * 0.6,
      chord: [],
    }));

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

    // Grow a connected configuration of frames from a seed.
    const buildChord = (seed: number) => {
      const set = [seed];
      const size = 3 + ((rng() * 3) | 0);
      let guard = 0;
      while (set.length < size && guard++ < 30) {
        const from = set[(rng() * set.length) | 0];
        const opts = ADJ[from].filter((j) => !set.includes(j));
        if (opts.length) set.push(opts[(rng() * opts.length) | 0]);
      }
      return set;
    };

    const draw = () => {
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);
      const t = frame * 0.01;
      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;
      const agentY = (a: Agent) => 0.24 + 0.02 * Math.sin(t * 1.6 + a.ph);

      // Agents strike chords on their own clocks.
      for (const a of agents) {
        if (t >= a.next) {
          let seed = 0;
          let bd = 1e9;
          for (let i = 0; i < NF; i++) {
            const d = Math.abs(FR[i].x - a.x) + rng() * 0.2;
            if (d < bd) {
              bd = d;
              seed = i;
            }
          }
          a.chord = buildChord(seed);
          for (const i of a.chord) act[i] = 1;
          a.next = t + 1.1 + rng() * 1.4;
        }
      }
      for (let i = 0; i < NF; i++) act[i] *= 0.965;

      // Baseline substrate edges (faint), brighter where a chord runs through.
      ctx.strokeStyle = color;
      for (let i = 0; i < NF; i++) {
        for (const j of ADJ[i]) {
          if (j < i) continue;
          const lit = Math.min(act[i], act[j]);
          ctx.globalAlpha = 0.1 + 0.6 * lit;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx(FR[i].x), sy(FR[i].y));
          ctx.lineTo(sx(FR[j].x), sy(FR[j].y));
          ctx.stroke();
        }
      }

      // Tethers from each agent up to the frames of its current chord.
      for (const a of agents) {
        for (const i of a.chord) {
          if (act[i] < 0.04) continue;
          ctx.globalAlpha = 0.4 * act[i];
          ctx.beginPath();
          ctx.moveTo(sx(a.x), sy(agentY(a) + 0.02));
          ctx.lineTo(sx(FR[i].x), sy(FR[i].y));
          ctx.stroke();
        }
      }

      // Frames in the substrate band.
      ctx.fillStyle = color;
      for (let i = 0; i < NF; i++) {
        ctx.globalAlpha = 0.28 + 0.65 * act[i];
        ctx.beginPath();
        ctx.arc(sx(FR[i].x), sy(FR[i].y), 1.5 + 1.3 * act[i], 0, Math.PI * 2);
        ctx.fill();
      }

      // Hovering agents (open markers).
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
