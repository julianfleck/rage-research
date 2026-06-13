import type { Scene, SceneContext } from "../types";
import { applyStandardForces, clearLinks, clearTrails } from "./_helpers";
import { briefTitle } from "../briefs";

const ID = "10-belief-attractors";

/* ── Config ────────────────────────────────────────────────────────── */

const NUM_PARTICLES = 120;
const PARTICLE_R = 2;
const BASE_GRAVITY = 0.002;
const ORBIT_DAMPING = 0.97; // heavy drag — particles settle into orbits fast
const CAPTURE_DIST = 110;
const ESCAPE_CHANCE = 0.0004;
const GROWTH_RATE = 0.3;
// (max attractor radius is now per-attractor: baseR * 2.5)
const GRAVITY_GROWTH = 0.4;
const INITIAL_SPEED = 0.1;
const LONG_RANGE_PULL = 0.00008;
const INTEGRATION_RATE = 0.02; // smaller = slower, less overshoot

interface Attractor {
  x: number;
  y: number;
  r: number;
  baseR: number;
  gravity: number;
  captured: number; // count of orbiting particles
  shade: number;
}

const TRAIL_LEN = 12;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  orbitingIdx: number; // -1 = free, else index into attractors
  shade: number;
  alpha: number;
  trail: Array<[number, number]>;
}

interface State {
  attractors: Attractor[];
  particles: Particle[];
  width: number;
  height: number;
  lastTime: number;
  startedAt: number;
}

let state: State | null = null;

/* ── Init ──────────────────────────────────────────────────────────── */

function init(width: number, height: number): State {
  const cx = width / 2;
  const cy = height / 2;
  const spread = Math.min(width, height) * 0.28;

  // Two attractors on a horizontal line: large left, tiny right.
  const bigR = 35;
  const smallR = 4;
  const hSpread = spread * 0.75;
  const attractors: Attractor[] = [
    {
      x: cx - hSpread, y: cy,
      r: bigR, baseR: bigR,
      gravity: BASE_GRAVITY * 3.0,
      captured: 0, shade: 220,
    },
    {
      x: cx + hSpread, y: cy,
      r: smallR, baseR: smallR,
      gravity: BASE_GRAVITY * 0.15,
      captured: 0, shade: 200,
    },
  ];

  const particles: Particle[] = [];
  const pad = 40;
  for (let i = 0; i < NUM_PARTICLES; i++) {
    const px = pad + Math.random() * (width - pad * 2);
    const py = pad + Math.random() * (height - pad * 2);
    const angle = Math.random() * Math.PI * 2;
    const speed = INITIAL_SPEED * (0.3 + Math.random() * 0.7);
    particles.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      orbitingIdx: -1,
      shade: 200 + Math.floor(Math.random() * 55),
      alpha: 0.85,
      trail: [],
    });
  }

  const now = performance.now();
  return { attractors, particles, width, height, lastTime: now, startedAt: now };
}

/* ── Physics ───────────────────────────────────────────────────────── */

function tick(s: State) {
  const now = performance.now();
  const dtRaw = now - s.lastTime;
  s.lastTime = now;
  const dt = Math.min(dtRaw, 50); // cap for tab-away

  // Gravity ramp: starts gentle, ramps up after 1s.
  const age = (now - s.startedAt) / 1000; // seconds
  const gravityMult = age < 1 ? 0.3 : Math.min(4, 0.3 + (age - 1) * 1.2);

  // Reset captured counts.
  for (const a of s.attractors) a.captured = 0;

  for (const p of s.particles) {
    // Find nearest attractor for long-range pull.
    let nearestDist = Infinity;
    let nearestIdx = 0;

    // Gravity from all attractors.
    for (let ai = 0; ai < s.attractors.length; ai++) {
      const a = s.attractors[ai];
      const dx = a.x - p.x;
      const dy = a.y - p.y;
      const dist2 = dx * dx + dy * dy;
      const dist = Math.sqrt(dist2);
      if (dist < nearestDist) { nearestDist = dist; nearestIdx = ai; }
      if (dist < 1) continue;

      // 1/r² gravity — supports stable orbits. Ramped over time.
      const softDist = Math.max(dist, a.r * 1.5);
      const force = a.gravity * gravityMult * dt * 50 / (softDist * softDist);
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;

      // Check if orbiting.
      if (dist < CAPTURE_DIST) {
        if (p.orbitingIdx === -1) p.orbitingIdx = ai;
        if (p.orbitingIdx === ai) a.captured++;
      }
    }

    // Long-range pull toward nearest attractor — prevents stranding.
    if (p.orbitingIdx === -1 && nearestDist > CAPTURE_DIST) {
      const a = s.attractors[nearestIdx];
      const dx = a.x - p.x;
      const dy = a.y - p.y;
      const d = Math.max(1, nearestDist);
      p.vx += (dx / d) * LONG_RANGE_PULL * dt * d; // constant pull regardless of distance
      p.vy += (dy / d) * LONG_RANGE_PULL * dt * d;
    }

    // Escape chance for orbiting particles.
    if (p.orbitingIdx >= 0 && Math.random() < ESCAPE_CHANCE) {
      // Kick in a random direction.
      const kickAngle = Math.random() * Math.PI * 2;
      const kickSpeed = 1.2 + Math.random() * 0.8;
      p.vx += Math.cos(kickAngle) * kickSpeed;
      p.vy += Math.sin(kickAngle) * kickSpeed;
      p.orbitingIdx = -1;
    }

    // Check if left orbit.
    if (p.orbitingIdx >= 0) {
      const a = s.attractors[p.orbitingIdx];
      const dx = a.x - p.x;
      const dy = a.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) > CAPTURE_DIST * 1.5) {
        p.orbitingIdx = -1;
      }
    }

    // Damping.
    p.vx *= ORBIT_DAMPING;
    p.vy *= ORBIT_DAMPING;

    // Trail.
    p.trail.push([p.x, p.y]);
    if (p.trail.length > TRAIL_LEN) p.trail.shift();

    // Integrate.
    p.x += p.vx * dt * INTEGRATION_RATE;
    p.y += p.vy * dt * INTEGRATION_RATE;

    // Soft bounce off canvas edges.
    const margin = 20;
    if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx) * 0.5; }
    if (p.x > s.width - margin) { p.x = s.width - margin; p.vx = -Math.abs(p.vx) * 0.5; }
    if (p.y < margin) { p.y = margin; p.vy = Math.abs(p.vy) * 0.5; }
    if (p.y > s.height - margin) { p.y = s.height - margin; p.vy = -Math.abs(p.vy) * 0.5; }
  }

  // Grow attractors based on captured count.
  const dtSec = dt / 1000;
  for (const a of s.attractors) {
    // Growth scales with base size — small attractors stay small.
    const growthPerCapture = (a.baseR / 35) * 1.5;
    const maxR = a.baseR * 2.5; // can't grow beyond 2.5x its base
    const targetR = Math.min(maxR, a.baseR + a.captured * growthPerCapture);
    a.r += (targetR - a.r) * GROWTH_RATE * dtSec * 10;

    const gravGrowthScale = a.baseR / 35;
    const targetG = a.baseR < 10
      ? a.gravity // tiny attractor: gravity stays fixed
      : BASE_GRAVITY * (1 + a.captured * GRAVITY_GROWTH * gravGrowthScale);
    a.gravity += (targetG - a.gravity) * 0.02;
  }
}

/* ── Draw ──────────────────────────────────────────────────────────── */

function draw(c: CanvasRenderingContext2D) {
  const s = state;
  if (!s) return;

  c.save();

  // Draw orbital trails: faint circles showing capture radius.
  for (const a of s.attractors) {
    const trailAlpha = 0.04 + Math.min(0.08, a.captured * 0.005);
    c.strokeStyle = `rgba(255,255,255,${trailAlpha.toFixed(3)})`;
    c.lineWidth = 1;
    c.beginPath();
    c.arc(a.x, a.y, CAPTURE_DIST, 0, Math.PI * 2);
    c.stroke();
  }

  // Particle trails.
  c.lineCap = "round";
  for (const p of s.particles) {
    const len = p.trail.length;
    if (len < 2) continue;
    for (let i = 1; i < len; i++) {
      const t = i / len;
      c.strokeStyle = `rgba(${p.shade},${p.shade},${p.shade},${(t * 0.25 * p.alpha).toFixed(3)})`;
      c.lineWidth = t * 1.5;
      c.beginPath();
      c.moveTo(p.trail[i - 1][0], p.trail[i - 1][1]);
      c.lineTo(p.trail[i][0], p.trail[i][1]);
      c.stroke();
    }
  }

  // Draw particles.
  for (const p of s.particles) {
    const c1 = p.shade;
    c.fillStyle = `rgba(${c1},${c1},${c1},${p.alpha.toFixed(3)})`;
    c.beginPath();
    c.arc(p.x, p.y, PARTICLE_R, 0, Math.PI * 2);
    c.fill();
  }

  // Draw attractors — glow only, no solid core.
  for (const a of s.attractors) {
    const glowR = a.r * 3;
    const glowAlpha = 0.04 + a.captured * 0.006;
    const grad = c.createRadialGradient(a.x, a.y, 0, a.x, a.y, glowR);
    grad.addColorStop(0, `rgba(255,255,255,${Math.min(0.18, glowAlpha).toFixed(3)})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = grad;
    c.beginPath();
    c.arc(a.x, a.y, glowR, 0, Math.PI * 2);
    c.fill();
  }

  c.restore();
}

/* ── Scene export ──────────────────────────────────────────────────── */

export const scene10: Scene = {
  id: ID,
  title: "belief attractors",

  apply({ sim, nodes, links, width, height, setTitle }: SceneContext) {
    setTitle(briefTitle(ID, "belief attractors — stable orbits deepen gravity"));

    nodes.length = 0;
    clearTrails(nodes);
    clearLinks(links);
    applyStandardForces(sim, { cx: width / 2, cy: height / 2 });
    sim.nodes(nodes);
    sim.alphaTarget(0).alpha(0);

    state = init(width, height);
  },

  tick(ctx) {
    if (!state) return;
    if (state.width !== ctx.width || state.height !== ctx.height) {
      state.width = ctx.width;
      state.height = ctx.height;
    }
    tick(state);
  },

  draw(c) {
    draw(c);
  },

  cleanup() {
    state = null;
  },
};
