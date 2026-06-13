import type { Node, Link, Scene, SceneContext, ThemeName } from "./types";

export type { ThemeName };

interface Palette {
  /** canvas background */
  bg: string;
  /** link colour as "r,g,b" (alpha applied per-link) */
  linkRgb: string;
  /** invert neutral grayscale node shades (so light-on-dark becomes dark-on-light) */
  invertShade: boolean;
}

// Light theme is for screenshotting figures into the paper on a white ground.
// Heat colours (node.rgb) and the orange accent read on both grounds and are
// left untouched; only the neutral greys and the link colour flip.
export const THEMES: Record<ThemeName, Palette> = {
  dark: { bg: "#111111", linkRgb: "220,220,220", invertShade: false },
  light: { bg: "#ffffff", linkRgb: "40,40,40", invertShade: true },
};

const ACCENT = "#FF5A2D";
const LINK_DEFAULT_ALPHA = 0.55;
const LINK_WIDTH = 3;

export interface RenderState {
  nodes: Node[];
  links: Link[];
  width: number;
  height: number;
  dpr: number;
  theme: ThemeName;
}

/** Render a single frame into `ctx` (ticks the scene first). Used by both the
 *  full-screen deck loop and the per-chart embed loop (src/embed.ts). */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  scene: Scene | null,
  sceneCtx: SceneContext,
) {
  const { width, height, dpr, nodes, links } = state;
  const theme = THEMES[state.theme] ?? THEMES.dark;
  if (scene?.tick) scene.tick(sceneCtx);

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = LINK_WIDTH;
  ctx.lineCap = "round";
  for (const l of links) {
    const s = l.source as Node;
    const t = l.target as Node;
    if (s.x == null || t.x == null) continue;
    const la = l.alpha ?? LINK_DEFAULT_ALPHA;
    ctx.strokeStyle = `rgba(${theme.linkRgb},${la.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y!);
    ctx.lineTo(t.x, t.y!);
    ctx.stroke();
  }

  for (const n of nodes) {
    if (n.x == null) continue;
    const a = n.alpha ?? 1;
    // Heat nodes keep their rgb; neutral nodes use shade, inverted in light theme.
    let cr: number, cg: number, cb: number;
    if (n.rgb) {
      cr = Math.round(n.rgb[0]);
      cg = Math.round(n.rgb[1]);
      cb = Math.round(n.rgb[2]);
    } else {
      let c = Math.round(n.shade);
      if (theme.invertShade) c = 255 - c;
      cr = cg = cb = c;
    }
    if (n.trailMax && n.trailMax > 0) {
      (n.trail ??= []).push([n.x, n.y!]);
      if (n.trail.length > n.trailMax) n.trail.shift();
      for (let i = 0; i < n.trail.length - 1; i++) {
        const [px, py] = n.trail[i], t = i / n.trail.length;
        ctx.fillStyle = n.accent
          ? `rgba(255,90,45,${(t * 0.5 * a).toFixed(3)})`
          : `rgba(${cr},${cg},${cb},${(t * 0.5 * a).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, n.r * 0.4 * t, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (n.trail?.length) n.trail.length = 0;
    if (n.accent) {
      ctx.fillStyle = ACCENT;
      ctx.globalAlpha = a;
    } else {
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${a.toFixed(3)})`;
    }
    ctx.beginPath();
    ctx.arc(n.x, n.y!, n.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (scene?.draw) scene.draw(ctx, sceneCtx);

  ctx.restore();
}

export function startRenderLoop(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  hooks?: { getScene?: () => Scene | null; sceneCtx?: SceneContext },
) {
  const draw = () => {
    const scene = hooks?.getScene?.() ?? null;
    if (hooks?.sceneCtx) drawFrame(ctx, state, scene, hooks.sceneCtx);
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
