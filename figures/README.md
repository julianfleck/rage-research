# Figures — how we build them

These are the inline diagrams for the lab notes. They are small, animated,
black-and-white canvases that each illustrate **one idea** from a note. This file
is the design brief: read it before adding or changing a figure.

## What a figure is for

A figure carries a single concept from the note it sits in — no more. The note's
prose and the figure's **caption** do the explaining; the figure shows the
*shape* of the idea (a membrane forming, a threshold opening, a field aligning).
If you can't say in one sentence what a figure shows, it's doing too much.

Each figure is anchored in a note section:

```mdx
<Figure id="membrane-permeability" margin caption="A channel opens when retrieval clears a threshold…" />
```

`margin` floats it in the rail beside the text (the default for notes); without
it the figure renders inline at content width.

## Aesthetic

- **Black and white, theme-aware.** Everything draws in `currentColor`, read from
  the canvas each frame, so figures invert correctly in light/dark. Never
  hard-code a colour.
- **Restrained and organic.** This is a lab notebook, not a dashboard. Prefer
  soft contours, gentle motion, irregular blobs over hard geometry. A figure
  should feel alive but never demand attention or distract from reading.
- **Illustrative, not interactive.** Default to an autonomous animation that
  reads on its own — a slow loop, a breathing boundary, a drifting field.
  Interactive *widgets* (sliders, readouts, "reasoning room" gauges) were tried
  and removed: they read as UI, not as illustration. Mouse interaction is fine as
  an *enrichment* (e.g. the cursor combing the resonance field) but the figure
  must still make its point untouched.
- **Each figure looks distinct.** Two figures that animate the same way (e.g. two
  "expanding circles") read as the same chart twice. If a new figure resembles an
  existing one, change the *mechanic*, not just the labels.
- **Gentle motion.** No harsh snaps. Damp springs, ramp forces in, fade at
  boundaries (smoothstep). If something overshoots and rings, add friction.
- **Captions are plain and technical.** Say what the figure shows. No poetic
  flourish, no "resonance as a field, brightening as it comes alive" slop.

## The canvas contract

Every canvas figure follows the same skeleton (copy an existing one — `type-drift`
is the simplest, `substrate-hero-coact` the richest):

```tsx
"use client";
import { useEffect, useRef } from "react";

export function MyFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);   // cap DPR at 2
    let raf = 0, t = 0, w = 0, h = 0, frame = 0, color = "#888";

    const resize = () => { /* set canvas.width/height = size*dpr; setTransform(dpr…) */ };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color; // theme refresh
      ctx.clearRect(0, 0, w, h);
      // ... ALWAYS set ctx.fillStyle / ctx.strokeStyle = color before drawing ...
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onVis = () => { /* pause on document.hidden, resume otherwise */ };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return <canvas ref={ref} className="block h-full w-full" aria-hidden />;
}
```

Non-negotiables:

- **Set `fillStyle`/`strokeStyle = color` before every draw.** Forgetting it is
  the classic dark-mode bug — shapes render black-on-black.
- **Work in normalized coordinates (0–1)** and multiply by `w`/`h`. Figures are
  square (the `canvas` kind is wrapped in `aspect-square`), so scale sizes by
  `Math.min(w, h)`.
- **Pause when hidden** and **clean everything up** in the effect return.
- **Deterministic layouts.** Seed positions/types with `mulberry32(seed)` at
  module load, not `Math.random()` in the loop — figures should look the same on
  every reload, and module-level randomness must be stable.
- **Refresh `color` periodically** (every ~40 frames is plenty) so theme toggles
  are picked up without per-frame cost.

### Overlaid labels

Wrap the canvas in a `relative` div and add corner labels when two poles need
naming (e.g. `summary` / `detail`):

```tsx
<div className="relative h-full w-full">
  <canvas ref={ref} className="block h-full w-full" aria-hidden />
  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
    <span>summary</span><span>detail</span>
  </div>
</div>
```

Use labels sparingly — most figures lean on the caption instead.

## Shared techniques

A small toolkit recurs across figures; reuse it rather than reinventing:

- **`mulberry32`** — seeded RNG for stable layouts.
- **Marching-squares contour over a gaussian-splat field** — the organic
  "membrane" blob. Splat a soft Gaussian at each warm node into a grid, then
  contour it. Used by `substrate-hero-coact`, `membrane-nesting`,
  `membrane-coordination`, `membrane-permeability`. Copy the `contour()` helper.
- **`glyph()`** — typed frame shapes (circle, triangle, square, diamond, star,
  cross) for showing frame-type variety.
- **Hebbian coupling + spring layout** — co-active nodes accumulate coupling and
  are pulled together toward a rest length, with friction. Keep it overdamped
  (friction ~0.8) so it settles without ringing.
- **Kuramoto / phase fields** — oscillators or orientation sources that align;
  the basis of the resonance figure.
- **smoothstep** (`x*x*(3-2x)`) for soft fades and frontiers.

### Two patterns worth knowing

- **Seamless loops.** Drive every per-element attribute (shape, rotation,
  opacity, scale) from a *continuous* parameter, not an integer index, so a cycle
  hands off without a pop. `fractal-zoom` is the worked example: rings are
  parametrized by `depth = level − phase`, so a ring at the end of a cycle is
  pixel-identical to the next ring at the start.
- **Mouse over a rail figure.** Margin figures are `pointer-events: none` (they
  live in a fixed rail), so a normal `onMouseMove` never fires. Listen on
  `window` instead and map `clientX/Y` through `canvas.getBoundingClientRect()`
  (see `resonance`). Guard against the cursor getting "stuck" inside by also
  gating on recent movement.

## Adding a figure

1. Write `my-figure.tsx` in this folder following the contract above. Put tunable
   constants at the top with one-line comments — the next person will tweak them.
2. Register it in `registry.tsx`: import it and add an entry, `kind: "canvas"`
   (square, default) or `"chart"` (raw, for anything that isn't a bare canvas).
3. Reference it from a note: `<Figure id="my-figure" margin caption="…" />`.
4. Rebuild and check: `pnpm content` then `pnpm exec tsc --noEmit`.
5. If the figure uses Tailwind classes, note that this folder is gitignored by the
   app, so `app/globals.css` already has `@source "../content/rage/figures"` to
   pull those classes into the build — keep figure markup to classes that are
   either standard or covered there.

Removing a figure: move the file to `TRASH/` and log it in `TRASH-FILES.md`
(the repo's trash convention), then drop its registry entry and note reference.

## Current figures

| id | shows |
|----|-------|
| `substrate-hero` | activation spreading over an evolving substrate; membranes forming/releasing (also the landing hero) |
| `substrate-playground` | the hero with its parameters exposed (the one intentional interactive piece, on its own page) |
| `coupling-propagation` | the hero with the membrane left out — bare propagation + binding |
| `membrane-permeability` | a channel opening at a threshold; the subgraph reaching through to a depth |
| `membrane-nesting` | three membranes over one field — nested and overlapping, not a partition |
| `membrane-coordination` | agents co-acting, wiring together, a team membrane forming then dissolving |
| `resonance` | phase-angle field — sources align frames into domains that interfere; cursor combs it |
| `fractal-zoom` | endless zoom into self-similar nested membranes |
| `frame-graph` | a frame-semantic graph under a co-retrieval sweep; a membrane forms around the co-active region |
| `belief-attractors` | gravity wells that deepen as they capture — one runs away (premature convergence) |
| `type-drift` | typed frames flowing in varied and collapsing to one type (homogenization) |
| `gini-spread`, `hill-types`, `hill-profile` | metric illustrations (concentration, diversity) |
| `task-spread`, `substrate-spread`, `topo-zoom`, `flow-field` | earlier conceptual sketches |

Keep this table current when you add or retire a figure.
