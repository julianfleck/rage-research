import type { Scene, SceneContext } from "../types";
import { applyStandardForces, clearLinks, clearTrails } from "./_helpers";
import { ACCENT_RGB, drawMembrane, heat, ink, muted } from "./_paint";

/* Schmidt Figure 1.b — "Semantic frame graph and substrate co-retrieval
 * dynamics." A field of grey semantic frames over a continuous activation
 * field, a red active-agent population in the hot core, a dashed membrane
 * around it, and labelled callouts.
 *
 * First composition pass — tune the constants below in `pnpm dev`. The heat
 * field is gradient-blob based for now; the upgrade is a KDE over particle
 * density (see FIGURE-TRANSLATION.md). */

const ID = "20-substrate";

/* ── Tunables ──────────────────────────────────────────────────────────── */
const NUM_FRAMES = 260;     // grey semantic-frame particles
const NUM_ACTIVE = 34;      // red active-agent population (in the core)
const FRAME_R = 2.2;
const ACTIVE_R = 3;
const DRIFT = 0.06;         // brownian wander (keep low so frames are screenshot-stable)
const HOME_PULL = 0.004;    // restoring pull toward each particle's home position
const FIELD_ALPHA = 0.5;    // heat-field opacity

interface HeatSource { dx: number; dy: number; sigma: number; peak: number; }
// Offsets/sigmas are fractions of min(width,height), relative to centre.
const SOURCES: HeatSource[] = [
  { dx: 0.00, dy: 0.00, sigma: 0.42, peak: 0.18 }, // broad cool wash
  { dx: -0.16, dy: 0.15, sigma: 0.08, peak: 0.5 },  // satellite
  { dx: 0.19, dy: 0.09, sigma: 0.09, peak: 0.62 },  // satellite
  { dx: 0.00, dy: 0.00, sigma: 0.13, peak: 1.0 },   // hot core
];

interface P { x: number; y: number; hx: number; hy: number; vx: number; vy: number; active: boolean; }

interface State { ps: P[]; width: number; height: number; last: number; }
let state: State | null = null;

/* ── Field ─────────────────────────────────────────────────────────────── */
function activationAt(s: State, x: number, y: number): number {
  const cx = s.width / 2, cy = s.height / 2;
  const u = Math.min(s.width, s.height);
  let a = 0;
  for (const src of SOURCES) {
    const sx = cx + src.dx * u, sy = cy + src.dy * u;
    const sig = src.sigma * u;
    const d2 = (x - sx) ** 2 + (y - sy) ** 2;
    a += src.peak * Math.exp(-d2 / (2 * sig * sig));
  }
  return Math.min(1, a);
}

/* ── Init ──────────────────────────────────────────────────────────────── */
function init(width: number, height: number): State {
  const cx = width / 2, cy = height / 2;
  const u = Math.min(width, height);
  const ps: P[] = [];

  // Semantic frames: denser toward the centre (gaussian scatter + uniform fill).
  for (let i = 0; i < NUM_FRAMES; i++) {
    const central = Math.random() < 0.55;
    let x: number, y: number;
    if (central) {
      const r = Math.abs(gauss()) * u * 0.22;
      const th = Math.random() * Math.PI * 2;
      x = cx + Math.cos(th) * r;
      y = cy + Math.sin(th) * r;
    } else {
      x = 40 + Math.random() * (width - 80);
      y = 40 + Math.random() * (height - 80);
    }
    ps.push({ x, y, hx: x, hy: y, vx: 0, vy: 0, active: false });
  }

  // Active-agent population: tight cluster in the hot core.
  for (let i = 0; i < NUM_ACTIVE; i++) {
    const r = Math.abs(gauss()) * u * 0.06;
    const th = Math.random() * Math.PI * 2;
    const x = cx + Math.cos(th) * r;
    const y = cy + Math.sin(th) * r;
    ps.push({ x, y, hx: x, hy: y, vx: 0, vy: 0, active: true });
  }

  return { ps, width, height, last: performance.now() };
}

function gauss(): number {
  // Box-Muller, one value.
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ── Tick ──────────────────────────────────────────────────────────────── */
function tick(s: State) {
  const now = performance.now();
  const dt = Math.min(now - s.last, 50) / 16.67;
  s.last = now;
  for (const p of s.ps) {
    p.vx += (Math.random() - 0.5) * DRIFT + (p.hx - p.x) * HOME_PULL;
    p.vy += (Math.random() - 0.5) * DRIFT + (p.hy - p.y) * HOME_PULL;
    p.vx *= 0.9; p.vy *= 0.9;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
}

/* ── Draw ──────────────────────────────────────────────────────────────── */
function draw(c: CanvasRenderingContext2D, theme: SceneContext["theme"]) {
  const s = state;
  if (!s) return;
  const cx = s.width / 2, cy = s.height / 2;
  const u = Math.min(s.width, s.height);

  // Heat field: layered radial gradients, cool wash first, hot core last.
  c.save();
  for (const src of SOURCES) {
    const sx = cx + src.dx * u, sy = cy + src.dy * u;
    const rad = src.sigma * u * 2.2;
    const [r, g, b] = heat(src.peak * 0.9);
    const grad = c.createRadialGradient(sx, sy, 0, sx, sy, rad);
    grad.addColorStop(0, `rgba(${r},${g},${b},${(FIELD_ALPHA * (0.5 + src.peak * 0.5)).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = grad;
    c.beginPath();
    c.arc(sx, sy, rad, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();

  // Membrane around the hot core.
  drawMembrane(c, cx, cy, u * 0.17, u * 0.13, theme, { alpha: 0.5 });

  // Semantic frames: grey, warm-tinted where activation is high.
  for (const p of s.ps) {
    if (p.active) continue;
    const a = activationAt(s, p.x, p.y);
    if (a > 0.45) {
      const [r, g, b] = heat(a);
      c.fillStyle = `rgba(${r},${g},${b},${(0.55 + a * 0.4).toFixed(3)})`;
    } else {
      c.fillStyle = muted(theme, 0.7);
    }
    c.beginPath();
    c.arc(p.x, p.y, FRAME_R, 0, Math.PI * 2);
    c.fill();
  }

  // Active-agent population: red.
  for (const p of s.ps) {
    if (!p.active) continue;
    c.fillStyle = `rgba(${ACCENT_RGB},0.95)`;
    c.beginPath();
    c.arc(p.x, p.y, ACTIVE_R, 0, Math.PI * 2);
    c.fill();
  }

  // Callouts: label + leader line + target dot.
  const callouts: Array<{ text: string; lx: number; ly: number; tx: number; ty: number }> = [
    { text: "Active Agent", lx: 0.04, ly: 0.30, tx: cx, ty: cy },
    { text: "Membrane", lx: 0.04, ly: 0.62, tx: cx - u * 0.17, ty: cy },
    { text: "Dormant Agent", lx: 0.78, ly: 0.30, tx: cx + u * 0.34, ty: cy - u * 0.12 },
    { text: "Document", lx: 0.30, ly: 0.92, tx: cx - u * 0.12, ty: cy + u * 0.22 },
    { text: "Session", lx: 0.70, ly: 0.92, tx: cx + u * 0.20, ty: cy + u * 0.20 },
  ];
  c.save();
  c.font = "13px ui-sans-serif, system-ui, sans-serif";
  for (const o of callouts) {
    const lx = o.lx * s.width, ly = o.ly * s.height;
    c.strokeStyle = ink(theme, 0.5);
    c.lineWidth = 1;
    c.setLineDash([]);
    c.beginPath();
    c.moveTo(lx, ly);
    c.lineTo(o.tx, o.ty);
    c.stroke();
    c.fillStyle = ink(theme, 0.95);
    c.beginPath();
    c.arc(o.tx, o.ty, 2.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = ink(theme, 0.9);
    c.textBaseline = "middle";
    c.textAlign = o.lx < 0.5 ? "left" : "right";
    c.fillText(o.text, lx, ly - 10);
  }
  c.restore();
}

/* ── Scene export ──────────────────────────────────────────────────────── */
export const scene20: Scene = {
  id: ID,
  title: "substrate co-retrieval",

  apply({ sim, nodes, links, width, height }: SceneContext) {
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
      state = init(ctx.width, ctx.height);
    }
    tick(state);
  },

  draw(c, ctx) {
    draw(c, ctx.theme);
  },

  cleanup() {
    state = null;
  },
};
