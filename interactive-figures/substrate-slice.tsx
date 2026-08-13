"use client";

import { useEffect, useRef } from "react";

// A slice of the substrate ecosystem. Frames sit in a band along the bottom,
// lightly wired into a graph; agents drift slowly along a line above it,
// appearing and leaving over time. Each turn an agent retrieves — it strikes a
// chord: a connected configuration of frames lights up and is pulled up out of
// the band toward the agent, the whole subgraph lifting together. As the
// retrieval decays the frames are released and sink back down into the
// substrate. Black/white, currentColor.
const NF = 22;
const TARGET_AGENTS = 3; // population the scene drifts back toward

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (x: number) => {
  const c = x < 0 ? 0 : x > 1 ? 1 : x;
  return c * c * (3 - 2 * c);
};

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

    const act = new Float32Array(NF); // how lit a frame is (decays each turn)
    const dx = new Float32Array(NF); // displacement from home (eased)
    const dy = new Float32Array(NF);
    const owner = new Int32Array(NF).fill(-1); // id of the agent pulling it
    const K = 0.5; // how far toward the agent a held frame is pulled

    type Agent = { id: number; x: number; vx: number; ph: number; born: number; life: number; next: number; chord: number[] };
    let agents: Agent[] = [];
    let nextId = 0;
    let nextSpawn = 0;

    // age 0..1 across the agent's life — used for fade in/out and for retirement.
    const ageFrac = (a: Agent, t: number) => (t - a.born) / a.life;
    const alphaOf = (a: Agent, t: number) => {
      const age = t - a.born;
      return Math.min(smooth(age / 0.6), smooth((a.life - age) / 0.8));
    };
    const spawn = (t: number, seedAge = 0) => {
      agents.push({
        id: nextId++,
        x: 0.1 + rng() * 0.8,
        vx: (rng() - 0.5) * 0.0008, // slow horizontal drift
        ph: rng() * 6.28,
        born: t - seedAge,
        life: 6 + rng() * 6,
        next: t + 0.3 + rng() * 1.0,
        chord: [],
      });
    };
    // Seed a staggered initial population so they don't all fade together.
    for (let i = 0; i < TARGET_AGENTS; i++) spawn(0, rng() * 5);

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

      // Population turnover: retire the old, refill toward the target.
      agents = agents.filter((a) => ageFrac(a, t) < 1);
      if (agents.length < TARGET_AGENTS && t >= nextSpawn) {
        spawn(t);
        nextSpawn = t + 0.8 + rng() * 1.6;
      }

      // Drift each agent slowly along the line, with a gentle random walk;
      // reflect at the edges so they stay over the substrate.
      for (const a of agents) {
        a.vx += (rng() - 0.5) * 0.00012;
        if (a.vx > 0.0009) a.vx = 0.0009;
        if (a.vx < -0.0009) a.vx = -0.0009;
        a.x += a.vx;
        if (a.x < 0.08) {
          a.x = 0.08;
          a.vx = Math.abs(a.vx);
        } else if (a.x > 0.92) {
          a.x = 0.92;
          a.vx = -Math.abs(a.vx);
        }
      }

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
          for (const i of a.chord) {
            act[i] = 1;
            owner[i] = a.id;
          }
          a.next = t + 1.1 + rng() * 1.4;
        }
      }
      for (let i = 0; i < NF; i++) act[i] *= 0.97;

      const byId = (id: number) => agents.find((a) => a.id === id);

      // Pull held frames up toward their owning agent; released or orphaned
      // frames (their agent has left) sink home.
      for (let i = 0; i < NF; i++) {
        let tdx = 0;
        let tdy = 0;
        if (act[i] > 0.02 && owner[i] >= 0) {
          const a = byId(owner[i]);
          if (a) {
            const pull = act[i];
            tdx = (a.x - FR[i].x) * K * pull;
            tdy = (agentY(a) + 0.05 - FR[i].y) * K * pull;
          }
        }
        dx[i] += (tdx - dx[i]) * 0.1;
        dy[i] += (tdy - dy[i]) * 0.1;
      }
      const fx = (i: number) => FR[i].x + dx[i];
      const fy = (i: number) => FR[i].y + dy[i];

      // Baseline substrate edges (faint), brighter where a chord runs through —
      // and they lift with the frames they connect.
      ctx.strokeStyle = color;
      for (let i = 0; i < NF; i++) {
        for (const j of ADJ[i]) {
          if (j < i) continue;
          const lit = Math.min(act[i], act[j]);
          ctx.globalAlpha = 0.1 + 0.6 * lit;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx(fx(i)), sy(fy(i)));
          ctx.lineTo(sx(fx(j)), sy(fy(j)));
          ctx.stroke();
        }
      }

      // Tethers from each agent up to the frames it is currently holding.
      for (const a of agents) {
        const aa = alphaOf(a, t);
        for (const i of a.chord) {
          if (act[i] < 0.04 || owner[i] !== a.id) continue;
          ctx.globalAlpha = 0.4 * act[i] * aa;
          ctx.beginPath();
          ctx.moveTo(sx(a.x), sy(agentY(a) + 0.02));
          ctx.lineTo(sx(fx(i)), sy(fy(i)));
          ctx.stroke();
        }
      }

      // Frames — lifted while held, settling back into the band as they release.
      ctx.fillStyle = color;
      for (let i = 0; i < NF; i++) {
        ctx.globalAlpha = 0.28 + 0.65 * act[i];
        ctx.beginPath();
        ctx.arc(sx(fx(i)), sy(fy(i)), 1.5 + 1.3 * act[i], 0, Math.PI * 2);
        ctx.fill();
      }

      // Drifting agents (open markers), fading in as they arrive and out as they
      // leave.
      ctx.lineWidth = 1.25;
      for (const a of agents) {
        const aa = alphaOf(a, t);
        const ax = sx(a.x);
        const ay = sy(agentY(a));
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.85 * aa;
        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5 * aa;
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
