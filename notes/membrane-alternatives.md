---
title: Membranes — alternative designs
internal: true
show: false
definition: A membrane is drawn from coupling density, which is built from co-attention — neither of which needs the oscillator. This note separates what establishing a membrane actually requires from what the Hopf layer adds, and sketches two simpler designs (scalar activation + coupling community; embedding-geometry coherence) to measure the full oscillator against.
description: Working note weighing how much machinery a membrane actually needs — arguing the oscillator is largely orthogonal to drawing a membrane, and sketching simpler designs to test the Hopf model against.
date: 2026-06-22
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - membrane
  - implementation
---

Internal note. Establishing [[membranes]] over the substrate is the task. This note asks a blunt question the [[hopf-oscillators|oscillator]] work raised: how much of the current machinery does a membrane actually need, and is there a simpler implementation that gets there. Written to be argued with, not adopted.

## What establishing a membrane actually requires

From the [[membranes]] definition, a membrane is a temporary, semi-permeable boundary drawn around a co-active region by [[coupling]] density. To establish one you need four things:

1. **A density measure over regions** — which frames are bound more tightly to each other than to their surroundings. Coupling strengths in the `couplings` table already give this.
2. **A boundary-drawing step** — take that density and emit a membrane: a set of frames with an inside and an outside. This must allow **overlap and nesting**, not a partition (a frame can be in two membranes; one membrane can sit inside another). *Not built.* There's no routine that turns coupling density into a boundary.
3. **A release mechanism** — membranes dissolve as their region falls dormant. Bifurcation decay gives this on the activation side; coupling decay gives it on the structure side.
4. **A read over the boundary** — coherence, diversity, permeability computed over the enclosed subgraph. *Mostly not built* — coherence exists but only globally (see [[hopf-oscillators]]), diversity isn't computed.

The gap is items 2 and 4: drawing an overlapping/nested boundary, and reading metrics over a subgraph. Item 1 is largely there; item 3 partly.

## The oscillator is mostly orthogonal to it

Here's the claim worth testing. **None of the four requirements needs the oscillator to draw the boundary.** Density (1) comes from co-attention coupling, which never touches `z`. The boundary (2) is a graph problem over coupling strength. Release (3) can run off coupling decay alone. The oscillator contributes to (4) — phase-coherence as one possible read over a membrane — and offers an alternative signal of co-activity (synchronization) that we could draw boundaries from instead of density. But it is not what the boundary rests on.

So the substantial investment in Hopf dynamics is, for the membrane task specifically, a **parallel track**: it gives a candidate readout and a candidate release clock, not the thing that picks out the region. That's worth saying plainly before building more on top of it.

## Simpler design A — scalar activation + coupling community

Drop the oscillator entirely for the membrane task. Each frame keeps a single scalar activation that gets bumped on attention and decays exponentially (a leaky integrator — the cheap half of what Hopf does). Co-attention builds coupling strength, as now. A membrane is then a **dense community in the coupling graph among currently-active frames** — community detection that permits overlap (e.g. link-based or clique-percolation methods, which give overlapping/nested communities rather than a partition). Health reads come off the graph directly: internal-vs-external coupling (conductance / modularity), and [[hill-diversity|diversity]] of frame types inside.

This delivers all four requirements — forgetting, co-activity, an overlapping boundary, a read over it — with one float per frame and no ODE. For *drawing and reading* membranes it may be sufficient on its own.

## Simpler design B — embedding-geometry coherence

If design A's "internal coupling density" feels too thin a notion of coherence, use the embeddings already on every frame rather than crushing them to a phase angle. A membrane's coherence becomes how tightly its frames cluster in embedding space — average cosine to the centroid, or the Hill profile over the region. "In sync" becomes "close in meaning and co-active," which is more faithful to the content than a 1D phase, and reuses data we already have. This pairs with design A: A draws the boundary from use, B reads coherence from meaning, and the gap between them (a membrane dense in coupling but spread in embedding space) is itself a signal — use binding together things that don't mean the same, which is close to what lock-in looks like.

## When the full Hopf earns its keep

The oscillator stops being orthogonal exactly when **synchronization dynamics are the object of study** — not membranes as boundaries, but the *process* of frames falling into and out of phase-lock: bifurcation delay, the hysteresis in how `a` is driven, whether a region's phase coheres before or after its coupling densifies. If we want to claim that a substrate-level phase signal *precedes* the visible failure (the Schmidt-proposal wager), the dynamics of synchronization are where that lead time would live, and a phase model is how you'd measure it. That's a real reason to keep Hopf — as a research instrument for the dynamics, not as infrastructure for the boundary.

The two roles should be kept separate in the build: a membrane layer that draws and reads boundaries from coupling (design A/B), and a dynamics layer that studies synchronization over them (Hopf). Coupling them prematurely is what makes the current code read as more joined-up than it is.

## Open question / recommendation

Build design A as the membrane baseline and measure the Hopf model against it: does phase-coherence over a membrane tell us anything that internal coupling density and embedding-cluster tightness don't already? If it doesn't, the oscillator stays in the dynamics track and out of the membrane path. If it does — if phase leads where density lags — that's the first concrete evidence the oscillator is worth its weight. Either way the experiment is cheap and the answer settles a central architectural question. (Pairs with the modular-testbed plan in [[codebase]]: membrane-drawing is one swappable mechanism, coherence-read is another.)

<Related tags="membrane" />
