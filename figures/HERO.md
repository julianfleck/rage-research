# attractor.space — landing hero figure (working notes)

A handoff doc for the animated hero on the landing page. We've iterated a lot;
this captures the model, the decisions, the current state, and the open changes.

## What it is

A black-and-white canvas animation that visualizes **substrate dynamics** —
the subject of the site (see the writing-repo article *Observing Dynamics over
Self-Governing Graphs*, at `content/writing/projects/2025-rage/articles/2026-substrate-dynamics/substrate-dynamics.mdx`).
It is the default figure in the landing margin (`components/landing.tsx`,
`DEFAULT_FIG`), and on collection/landing pages the margin figure also swaps to
a row's first figure on hover.

## Conceptual model (grounded in the article)

- **Frame** = node. A typed knowledge unit.
- **Substrate** = the shared frame-graph a population of agents reads from and
  writes back into. Each write reshapes what others retrieve next.
- **Coupling** = connection between frames that **strengthens when they're
  co-retrieved/co-activated (Hebbian)** and relaxes when they're not.
- **Membrane** = a *boundary region where context is densely co-activated*,
  surrounded by sparser coupling. The active agent population works inside it.
- **Energy injection** = the per-turn context injection; the leverage point.
- **Decay** = activation/coupling fade over time.

What we want to communicate: **the dynamics over an evolving graph and the
spread of activation patterns** — energy injected at a few frames, firing/
spreading across couplings, co-activated frames coupling together into
membranes that form and dissolve. NOT a static/literal graph diagram.

## Visual / aesthetic decisions (settled)

- Canvas, `currentColor` (white-on-dark / black-on-light), theme-aware.
- **Contour membranes via marching squares** over a scalar field (this look is a
  keeper — the field progression/rate from the "energy topology" version read
  best).
- **Small nodes**, sparse graph — keep it from looking busy/too-complex.
- **White only for currently-activated frames / fresh energy injections**, then
  fade to less bright, decaying further (steep opacity ~ a²). Resting frames are
  very faint.
- **Literal camera zoom** (gentle): zoomed out = see more of the field, zoomed
  in = see less. Keep subtle; over-zoom made it feel complex/clipped.
- Activation drifts over a **fixed-ish configuration** of frames — do NOT spawn
  entirely new subgraphs each event.
- Decay must **never drop activation to zero** — there's a non-zero `FLOOR` so
  the substrate always faintly hums and patterns can stabilize.

## Current implementation — three separated layers (SHIPPED)

File: `components/figures/substrate-hero-coact.tsx`. This is the live landing
hero: it's registered under the `substrate-hero` id in `registry.tsx`, which is
the landing's `DEFAULT_FIG`. The three layers are kept strictly separate:

- **activation `a[i]`** (per node, fast): energy injected at `SEEDS=2` individual
  seed frames → flashes to 1 (white) → **propagates one hop per frame** along
  edges (`a` boosts neighbours by ×`PROP=0.7`, attenuating) → decays toward
  `FLOOR` at rate `actDecay`. This is the traveling firing pattern.
- **coupling `c[edge]`** (per edge, slow, Hebbian): `c = c*coupDecay + coupLearn *
  (a_i-FLOOR)*(a_j-FLOOR)`. Rises only on **co-activation of both endpoints**,
  decays otherwise. Forms AND resolves over subgraphs.
- **membrane** = marching-squares contours over a field splatted from per-node
  **warmth** (sum of incident edge coupling). **Passive — exerts no force and
  does not touch coupling.**
- **gravity** = a spring **along coupled edges only** (`c > COUP_THRESH`) toward a
  **rest length** (`restLen`): attract beyond it, repel within → coupled frames
  settle at a spacing instead of collapsing. Plus a gentle constant home anchor
  (`HOME_K`) and short-range repulsion (`REPEL_D`). The membrane is not a force.
- Constants: `FLOOR=0.08`, `GRID=36`, `N=74`, 3-nearest graph, levels
  `[0.22,0.45,0.7]`, `COUP_THRESH=0.12`, `HOME_K=0.003`, `REPEL_D=0.05`.
- **Injection is per-injector, not global.** `INJECTORS=3` independent streams,
  each firing one random node then waiting its own random interval in
  `[injMin, injMax]` (props, default 0.4 / 1.3). Staggered so injections desync
  and the field never globally fades between turns; the spread of the interval
  range makes the rhythm breathe.

### Baked defaults (approved)

`actDecay=0.98`, `coupDecay=0.97`, `coupLearn=0.033`, `pull=0.052`,
`restLen=0.065`, `injMin=0.4`, `injMax=1.3`. All props live-tunable via refs.
Regime confirmed: **activation decay > coupling persistence** — firing lingers
and travels while coupling resolves, so subgraphs stay transient instead of
freezing into attractors that swallow everything.

## Playground (unlisted MDX page)

Now an MDX content page, not a bespoke route, so it gets the normal article
layout (header/rail/footer): `content/references/substrate-playground.mdx`,
served at `/references/substrate-playground`. It embeds the interactive widget
with `<Figure id="substrate-playground" />`; the widget is
`components/figures/substrate-playground.tsx` (figure + a slider per prop + a
caption per setting), registered in `registry.tsx` under `substrate-playground`
(kind `chart`, so `<Figure>` renders it raw — no aspect-square wrapper).

It's hidden from nav/listings via `unlisted: true` in frontmatter — the build
keeps unlisted entries in `content.json` (so they render + build) but
`lib/content.ts` filters them out of `navItems`, `allCategories`/
`articlesByCategory`, and `allTags`/`articlesByTag`. Unlisted pages get no
catalogId; `article-view.tsx` omits the id chip when absent.

Per-setting captions are in the widget (bound to the controls); the page's
frontmatter + intro prose are MDX-editable. Captions are grounded in
`content/writing/.../references/metrics.md` and the substrate-dynamics article:
activation decay → forgetting/decay rate, entropy, spread; coupling persistence
→ stabilization vs drift, coupling density/heat-death; coupling build rate →
Hebbian rate, attractor onset, Gini concentration vs Hill tail; pull strength +
rest length → visualization of cluster coherence/spacing; inject floor/ceiling →
energy-injection leverage point, exploration vs cooling.

(`content/references/about.mdx` was moved here too — About is now in the
References category, served at `/references/about`; footer link updated.)

## Status: DONE

All open changes implemented; figure wired as the landing hero; playground page
live at `/playground`. The superseded `substrate-hero.tsx` (structure v3) was
moved to `TRASH/`; `TRASH` added to `tsconfig.json` exclude.

Possible follow-ups (not requested): other dead variants
(`substrate-hero-field.tsx`, `substrate-hero-hybrid.tsx`, `flow-field.tsx`) are
still present — `flow-field` is still registered, the other two are unused.

## File map

- `components/figures/substrate-hero-coact.tsx` — **the live landing hero**.
- `components/figures/_archive/substrate-hero-coact-spread.tsx` — archived
  earlier "spread" version (reference, not imported).
- `components/figures/substrate-hero-field.tsx` — v1 energy topology (unused).
- `components/figures/substrate-hero-hybrid.tsx` — structure × atmosphere (unused).
- `components/figures/flow-field.tsx` — original hero (still registered, unused on landing).
- `components/figures/registry.tsx` — figure id → renderer (`substrate-hero` → coact).
- `components/landing.tsx` — landing; `DEFAULT_FIG="substrate-hero"` + hover-swap.

## Dev / verification notes

- Dev server runs at `http://localhost:3000` (app realpath
  `the attractor.space repo`; cwd is a symlink).
- Typecheck: `npx tsc --noEmit`.
- Content rebuild (for writing-repo content): `pnpm content`.
- To verify canvas visuals, drive Playwright (installed). Pattern used: write the
  probe script **inside the project dir** (NOT `/tmp` — module resolution fails),
  run it, then `mv` it to `TRASH/` (the hook blocks `rm`; `TRASH/` is gitignored).
  Screenshot the figure box (`document.querySelector('canvas').getBoundingClientRect()`)
  and `Read` the PNG.
- Canvas restrictions: this is app code, so `Math.random()` / `performance.now()`
  are fine (the workflow-script ban does not apply here).
