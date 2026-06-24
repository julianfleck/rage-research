---
title: Membranes / Metrics
internal: true
show: true
definition: "The candidate methods for drawing and reading a membrane: design A (scalar activation + overlapping coupling-community), design B (embedding-geometry coherence), and the full Hopf oscillator as a synchronization instrument that earns its weight only when synchronization dynamics are the object of study."
description: "Working note comparing the candidate membrane metrics — coupling-community detection, embedding-cluster coherence, and phase coherence — what each measures, how they pair, and where the oscillator does and doesn't help."
date: 2026-06-24
series: Membranes
status: draft
version: 1
author: Julian Fleck
tags:
  - membrane
  - implementation
---

> [!note] Internal
> The candidate measurement methods for [[membranes]] — how to *draw* a boundary and *read* coherence over it most cheaply. Builds on the requirements in [[membranes/implementation]]; gets tested in [[membranes/experiments]]; the open choices it leaves are collected in [[membranes/questions]]. Written to be argued with, not adopted.

## Simpler design A — scalar activation + coupling community

Drop the oscillator entirely for the membrane task. Each frame keeps a single scalar activation that gets bumped on attention and decays exponentially (a leaky integrator — the cheap half of what Hopf does). Co-attention builds coupling strength, as now. A membrane is then a **dense community in the coupling graph among currently-active frames** — community detection that permits overlap (e.g. link-based or clique-percolation methods, which give overlapping/nested communities rather than a partition). Health reads come off the graph directly: internal-vs-external coupling (conductance / modularity), and [[hill-diversity|diversity]] of frame types inside.

This delivers all four requirements from [[membranes/implementation]] — forgetting, co-activity, an overlapping boundary, a read over it — with one float per frame and no ODE. For *drawing and reading* membranes it may be sufficient on its own.

## Simpler design B — embedding-geometry coherence

If design A's "internal coupling density" feels too thin a notion of coherence, use the embeddings already on every frame rather than crushing them to a phase angle. A membrane's coherence becomes how tightly its frames cluster in embedding space — average cosine to the centroid, or the Hill profile over the region. "In sync" becomes "close in meaning and co-active," which is more faithful to the content than a 1D phase, and reuses data we already have. This pairs with design A: A draws the boundary from use, B reads coherence from meaning, and the gap between them (a membrane dense in coupling but spread in embedding space) is itself a signal — use binding together things that don't mean the same, which is close to what lock-in looks like.

## When the full Hopf earns its keep

The oscillator stops being orthogonal exactly when **synchronization dynamics are the object of study** — not membranes as boundaries, but the *process* of frames falling into and out of phase-lock: bifurcation delay, the hysteresis in how `a` is driven, whether a region's phase coheres before or after its coupling densifies. If we want to claim that a substrate-level phase signal *precedes* the visible failure (the Schmidt-proposal wager), the dynamics of synchronization are where that lead time would live, and a phase model is how you'd measure it. That's a real reason to keep Hopf — as a research instrument for the dynamics, not as infrastructure for the boundary. Whether one phase angle is even the right representation for it is [[oscillators/questions|its own open question]], and arguably the one to settle first.

## Recommendation

Build design A as the membrane baseline and measure the Hopf model against it: does phase-coherence over a membrane tell us anything that internal coupling density and embedding-cluster tightness don't already? If it doesn't, the oscillator stays in the dynamics track and out of the membrane path. If it does — if phase leads where density lags — that's the first concrete evidence the oscillator is worth its weight. Either way the experiment is cheap and the answer settles a central architectural question. That experiment is specified in [[membranes/experiments]]. (Pairs with the modular-testbed plan in [[codebase]]: membrane-drawing is one swappable mechanism, coherence-read is another.)

<Related tags="membrane" />
