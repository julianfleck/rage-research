import type { ThemeName } from "../types";

/* ── Theme-aware ink ───────────────────────────────────────────────────
 * Scene-level draws (custom canvas, outside the shared node renderer) must
 * pick their own colours. Use these instead of hard-coding rgba(255,255,255).
 */

/** Foreground ink as "r,g,b": near-white on dark, near-black on light. */
export function inkRGB(theme: ThemeName): string {
  return theme === "light" ? "20,20,20" : "245,245,245";
}

/** Muted grey for secondary marks (semantic-frame dots, leader lines). */
export function mutedRGB(theme: ThemeName): string {
  return theme === "light" ? "120,120,120" : "150,150,150";
}

/** Convenience: rgba string at alpha. */
export function ink(theme: ThemeName, a: number): string {
  return `rgba(${inkRGB(theme)},${a.toFixed(3)})`;
}
export function muted(theme: ThemeName, a: number): string {
  return `rgba(${mutedRGB(theme)},${a.toFixed(3)})`;
}

export const ACCENT_RGB = "255,90,45"; // active-agent population (reads on both grounds)

/* ── Activation heat ramp ──────────────────────────────────────────────
 * Maps activation 0..1 to colour, matching the Schmidt legend: cool (low) →
 * warm (high). Blue → teal → green → yellow → orange → red. Theme-independent
 * (the heat carries meaning; it is not inverted between themes).
 */
const HEAT_STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [40, 70, 190]],   // deep blue   (low activation)
  [0.22, [30, 150, 190]], // teal
  [0.45, [70, 185, 120]], // green
  [0.65, [225, 205, 80]], // yellow
  [0.82, [240, 140, 45]], // orange
  [1.0, [220, 50, 40]],   // red         (high activation)
];

export function heat(t: number): [number, number, number] {
  const u = Math.max(0, Math.min(1, t));
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [t1, c1] = HEAT_STOPS[i];
    if (u <= t1) {
      const [t0, c0] = HEAT_STOPS[i - 1];
      const f = (u - t0) / (t1 - t0 || 1);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * f),
        Math.round(c0[1] + (c1[1] - c0[1]) * f),
        Math.round(c0[2] + (c1[2] - c0[2]) * f),
      ];
    }
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1][1];
}

export function heatRGBA(t: number, a: number): string {
  const [r, g, b] = heat(t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/* ── Membrane contour ──────────────────────────────────────────────────
 * A dashed closed boundary around a region of co-activated context. Drawn as
 * a (rotatable) ellipse for now; swap for a marching-squares contour over the
 * activation field once the field is real.
 */
export function drawMembrane(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  theme: ThemeName,
  opts: { rotation?: number; alpha?: number; dash?: [number, number]; width?: number } = {},
) {
  const { rotation = 0, alpha = 0.55, dash = [7, 7], width = 1.5 } = opts;
  c.save();
  c.setLineDash(dash);
  c.lineWidth = width;
  c.strokeStyle = ink(theme, alpha);
  c.beginPath();
  c.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}
