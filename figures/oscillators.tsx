"use client";

import { useEffect, useRef } from "react";

// Each frame is an oscillator. A dot orbits a small ring: the ring's radius is the
// frame's amplitude (how active it is), the dot's angle is its phase. The first
// CLUSTER frames are mutually coupled (joined by faint ties) and pull each other
// into the same phase, so they sweep in unison; loners drift at their own
// frequency; dormant frames collapse to a still point at the centre. One loner
// periodically wakes on "attention" and decays again. Black/white, currentColor.

const N = 13; // oscillators
const CLUSTER = 6; // first CLUSTER nodes are mutually coupled and synchronize
const K = 0.06; // phase-coupling strength within the cluster
const ORBIT = 0.055; // orbit radius at full amplitude (× min(w,h))
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
// orbits don't overlap. Stable across reloads (seeded RNG, no Math.random).
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
      ctx.globalAlpha = 0.12;
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
        const r = ORBIT * m * amp[i];
        // orbit ring
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.18;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.stroke();
        // centre
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, 0.8, 0, Math.PI * 2);
        ctx.fill();
        // orbiting dot — brighter and larger the more active the frame
        const dx = cx + Math.cos(phase[i]) * r;
        const dy = cy + Math.sin(phase[i]) * r;
        ctx.globalAlpha = 0.35 + 0.6 * amp[i];
        ctx.beginPath();
        ctx.arc(dx, dy, 1.4 + 2.2 * amp[i], 0, Math.PI * 2);
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
