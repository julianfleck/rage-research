"use client";

import { useEffect, useRef } from "react";

// Each frame is an oscillator with two quantities, both shown. PHASE — a faint
// reference ring with a tick that travels round it (where the frame is in its
// cycle). AMPLITUDE — the core pulses: it swells and brightens once per cycle,
// deeply if the frame is active, barely if it is dormant (the observable r·cos θ,
// not a static radius). The first CLUSTER frames are mutually coupled (faint ties)
// and pull into the same phase, so they breathe in unison; loners fall out of
// step; one loner periodically wakes on "attention" and decays. currentColor.

const N = 13; // oscillators
const CLUSTER = 6; // first CLUSTER nodes are mutually coupled and synchronize
const K = 0.06; // phase-coupling strength within the cluster
const RING = 0.05; // reference phase-ring radius (× min(w,h))
const CORE = 0.038; // core radius at full pulse (× min(w,h))
const SPEED = 0.05; // base phase advance per frame
const AMP_RATE = 0.04; // how fast amplitude tracks its target

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Node {
  x: number;
  y: number;
  freq: number; // natural frequency
  cluster: boolean;
  ampTarget: number; // resting amplitude (0 = dormant, 1 = full)
  wake: boolean; // pulses awake then decays, to show the attention/decay tug
}

// Deterministic layout: jittered points in a disc, rejection-sampled so the
// rings don't overlap. Stable across reloads (seeded RNG, no Math.random).
const NODES: Node[] = (() => {
  const rng = mulberry32(20260622);
  const pts: [number, number][] = [];
  let guard = 0;
  while (pts.length < N && guard++ < 2000) {
    const x = 0.5 + (rng() - 0.5) * 0.86;
    const y = 0.5 + (rng() - 0.5) * 0.86;
    if ((x - 0.5) ** 2 + (y - 0.5) ** 2 > 0.42 * 0.42) continue;
    if (pts.some(([px, py]) => (px - x) ** 2 + (py - y) ** 2 < 0.16 * 0.16)) continue;
    pts.push([x, y]);
  }
  return pts.map(([x, y], i) => {
    const cluster = i < CLUSTER;
    const dormant = !cluster && rng() < 0.4;
    return {
      x,
      y,
      freq: 0.5 + rng() * 1.4,
      cluster,
      ampTarget: cluster ? 1 : dormant ? 0.08 : 0.5 + rng() * 0.4,
      wake: !cluster && i === pts.length - 1,
    };
  });
})();

export function OscillatorBank() {
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

    const phase = NODES.map((_, i) => (i * 1.7) % (Math.PI * 2));
    const amp = NODES.map((n) => (n.cluster ? 0.2 : n.ampTarget));

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

      // Mean phase of the cluster — the target its members are pulled toward.
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < NODES.length; i++) {
        if (NODES[i].cluster) {
          sx += Math.cos(phase[i]);
          sy += Math.sin(phase[i]);
        }
      }
      const meanAng = Math.atan2(sy, sx);

      for (let i = 0; i < NODES.length; i++) {
        const n = NODES[i];
        let dth = n.freq * SPEED;
        if (n.cluster) dth += K * Math.sin(meanAng - phase[i]); // Kuramoto pull
        phase[i] += dth;
        let target = n.ampTarget;
        if (n.wake) target = 0.08 + 0.92 * Math.max(0, Math.sin(t * 0.5)) ** 2;
        amp[i] += (target - amp[i]) * AMP_RATE;
      }

      // Faint ties between coupled frames, so the synchrony reads as coupling.
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          if (NODES[i].cluster && NODES[j].cluster) {
            ctx.beginPath();
            ctx.moveTo(NODES[i].x * w, NODES[i].y * h);
            ctx.lineTo(NODES[j].x * w, NODES[j].y * h);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < NODES.length; i++) {
        const cx = NODES[i].x * w;
        const cy = NODES[i].y * h;
        const osc = 0.5 + 0.5 * Math.cos(phase[i]); // the oscillation, 0..1
        const pulse = amp[i] * osc; // 0..amp — depth scaled by how active the frame is

        // Phase: a faint reference ring with a tick travelling round it.
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, RING * m, 0, Math.PI * 2);
        ctx.stroke();
        const tx = cx + Math.cos(phase[i]) * RING * m;
        const ty = cy + Math.sin(phase[i]) * RING * m;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Amplitude: the core pulses — swells and brightens once per cycle, by an
        // amount set by the frame's amplitude. Dormant frames barely stir.
        ctx.globalAlpha = 0.16 + 0.72 * pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, (0.006 + CORE * pulse) * m, 0, Math.PI * 2);
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
