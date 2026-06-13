import { createSim } from "./sim";
import { drawFrame, type ThemeName } from "./render";
import { scenes } from "./scenes/index";
import type { Node, Link, Scene, SceneContext } from "./types";

/** A chart mounted into a bounded element on the scrolling page. Each chart
 *  gets its own canvas, simulation, and render loop; the loop only runs while
 *  the chart is in (or near) the viewport. */
export interface ChartHandle {
  id: string;
  setTheme(theme: ThemeName): void;
  destroy(): void;
}

export function mountChart(host: HTMLElement, sceneId: string, theme: ThemeName): ChartHandle | null {
  const scene: Scene | undefined = scenes.find((s) => s.id === sceneId);
  if (!scene) {
    console.warn(`[attractor] unknown chart scene: ${sceneId}`);
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "chart-canvas";
  host.prepend(canvas);
  const ctx = canvas.getContext("2d")!;

  const { sim, nodes, links } = createSim(1, 1);
  const state = { width: 0, height: 0, dpr: 1, nodes: nodes as Node[], links: links as Link[], theme };

  const sceneCtx: SceneContext = {
    sim,
    nodes,
    links,
    get width() { return state.width; },
    get height() { return state.height; },
    get theme() { return state.theme; },
    setTitle: () => {},
  };

  let applied = false;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    state.width = w;
    state.height = h;
    state.dpr = dpr;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
  }

  function applyScene() {
    if (state.width > 0 && state.height > 0) {
      scene!.apply(sceneCtx);
      applied = true;
    }
  }

  let raf = 0;
  function loop() {
    raf = requestAnimationFrame(loop);
    drawFrame(ctx, state, scene!, sceneCtx);
  }
  function start() { if (!raf) loop(); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  // Re-layout on resize (re-applies the scene at the new size).
  const ro = new ResizeObserver(() => {
    const before = state.width;
    size();
    if (state.width > 0 && (!applied || state.width !== before)) applyScene();
  });
  ro.observe(canvas);

  // Only animate while near the viewport.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          if (!applied) applyScene();
          start();
        } else {
          stop();
        }
      }
    },
    { rootMargin: "120px" },
  );
  io.observe(host);

  size();

  return {
    id: sceneId,
    setTheme(t) { state.theme = t; },
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
      scene!.cleanup?.();
      canvas.remove();
    },
  };
}

/** Mount every `[data-chart]` element within `root` (default: whole document). */
export function mountChartsIn(root: ParentNode, theme: ThemeName): ChartHandle[] {
  const hosts = Array.from(root.querySelectorAll<HTMLElement>("[data-chart]"));
  return hosts
    .map((el) => mountChart(el, el.dataset.chart!, theme))
    .filter((h): h is ChartHandle => h !== null);
}

/** Mount every `[data-chart]` element on the page. */
export function mountAllCharts(theme: ThemeName): ChartHandle[] {
  return mountChartsIn(document.body, theme);
}
