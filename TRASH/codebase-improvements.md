---
title: Codebase improvements
internal: true
show: true
definition: The internal backlog of deltas between what the concept notes describe and what rage-substrate actually does, with the proposed change for each. Companion to the state-of-the-codebase note; the concept notes stay aspirational, this one tracks what's actually built.
description: Collected implementation gaps and proposed improvements for the rage-substrate dynamics testbed — embedding richness collapsed to scalars, the one-directional oscillator/coupling wiring, global vs per-membrane coherence, and the membrane-drawing work that isn't built.
date: 2026-06-22
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - implementation
---

> [!note] Internal
> Paired with [[codebase]]. The published concept notes ([[membranes]], [[coupling]], [[coordination-phase]], [[resonance]]) describe what we *want* the substrate to be, and they should stay that way. This note is the other half: where the code in `julianfleck/rage-substrate` falls short of those descriptions, and what to change. Each entry is *what the concept wants → what's built → the proposed change*. Some changes are clear; others are hypotheses, marked as such.

## 1. Embedding richness collapsed to scalars

The most important one, and it runs through everything below. The substrate's whole subject is high-dimensional structure — meaning spread across a 4096-dimensional space — converging or diverging. But almost every place the code turns an embedding into a dynamical quantity, it first **crushes it to a scalar**, and does so before the dynamics even start:

- **Phase** (`embedding_to_phase`) — 4096 dims projected to 2D, then reduced to a single *angle*. The radius is thrown away; unrelated frames collide at the same phase routinely. "Similar phase ≈ similar meaning" survives only weakly.
- **Natural frequency** (`embedding_to_frequency`) — 4096 dims dotted with one random vector → one number. A different random shadow of the same vector, uncorrelated with the phase one except through the source.
- **Valence** (`_compute_interference`) — embedding cosine *plus keyword stance markers* ("however", "undermines", unity-vs-diversity word lists). The richest signal available (the full embedding geometry, and the frame slot structure) is reduced to one similarity number and a lexical heuristic.

So the representation collapses the very dimensionality the project exists to study, then tries to read convergence off the collapsed version. **Proposed direction:** read dynamical quantities from embedding *geometry* directly rather than from scalar projections of it —

- coherence over a region as cluster tightness in embedding space (cosine to centroid, or the [[hill-diversity]] profile) instead of a phase order parameter;
- if phase is kept, make it a *signature* (several dimensions) not one angle — this is what the phase-synthesis research direction wanted, and the implementation never followed;
- valence from frame **slot structure** (do the slots fit or disagree), which is what [[coupling]] already claims, rather than keyword markers.

This is also where the embedding-model-sensitivity study (Megan's) bites: every result is conditional on the embedding, and the more we collapse it, the more arbitrary that conditioning gets.

## 2. Oscillator and coupling are wired one-directionally

What the concept implies: a single coupled system where structure and rhythm shape each other. What's built (see [[oscillators/implementation]]): coupling *strength* drives the oscillator, but the oscillator never feeds back. Phase and amplitude only tilt retrieval ranking; they never change stored structure. The oscillator reads the substrate, it doesn't shape it.

**Proposed change:** either close the loop (let phase relationships inform coupling — two frames that won't phase-lock are evidence of interference) or accept the oscillator as a read-only dynamics instrument and stop implying otherwise in the prose. The decision depends on entry 5.

## 3. Coupling valence is recorded but inert

[[coupling]] says valence (alignment / interference / neutral) is what lets the substrate tell productive structure from accreted conflict. In the code, valence is computed and stored — and then ignored by the dynamics. The Hopf step reads `strength` only, so an *interfering* pair is pulled together exactly like an *aligning* one; there's no anti-phase push, no repulsion.

**Proposed change:** make valence modulate the coupling sign — interference as repulsive coupling (drive the pair toward anti-phase), alignment as attractive. At minimum, have *something* respond to a recorded conflict, since right now nothing does.

## 4. Coherence is global, should be per membrane

The order parameter is computed over *all* frames at once. Seeded at semantically spread phases, that global number sits near its random floor (≈ 1/√N) and barely moves regardless of local dynamics — it averages out exactly the local synchrony it's meant to detect.

**Proposed change:** read coherence over a [[membranes|membrane]] (a bounded co-active region), where a region tightening is a real, local event. This makes coherence a readout *over* an already-drawn boundary, not a substrate-wide statistic.

## 5. Membrane drawing isn't built — and may not need the oscillator

The boundary itself — taking [[coupling]] density and emitting an *overlapping, nested* membrane (not a partition), plus metrics read over the enclosed subgraph — has no implementation. And the boundary is a coupling-graph problem that doesn't depend on the oscillator at all.

**Proposed direction (full argument in [[membranes/metrics]]):** build a scalar-activation + overlapping-community baseline for drawing and reading membranes, and measure the Hopf model against it. If phase-coherence over a membrane tells us nothing that coupling density and embedding-cluster tightness don't, the oscillator stays in the dynamics track and out of the membrane path. The full Hopf earns its weight only as an instrument for *synchronization dynamics* — whether a phase signal *leads* visible failure (the Schmidt wager) — not as plumbing for the boundary.

## 6. Frequency is fixed at seeding

[[membranes]] describes a frame's frequency drifting toward the ones it attends to. The code sets `ω` once at initialization and never updates it. Minor, but it's a stated mechanism that isn't there.

**Proposed change:** either implement the drift or drop the claim from the concept note — but the concept note stays as-is until we decide, per the split this note exists to keep.

---

**Through-line:** most of these are the same mistake in different places — reaching for a scalar (one phase angle, one frequency, one similarity, one global coherence) where the substrate's whole point is structure that a scalar can't hold. The modular-testbed plan in [[codebase]] is what makes fixing them tractable: each is a swappable mechanism behind a common interface, measurable against the simpler baseline rather than adopted by commitment.

<Related tags="implementation" />
