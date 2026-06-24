---
title: Oscillators / Questions
internal: true
show: true
definition: "The open questions on the oscillator track, led by the one worth settling first — the complexity-reduction problem: collapsing a high-dimensional embedding to a single phase angle may throw away exactly the high-dimensional spread the project is trying to watch. Plus global-vs-per-membrane coherence and whether the ODE earns its weight."
description: "The collected open questions for the oscillator layer — the lossy collapse of an embedding to one phase angle, whether a phase signature beats a scalar, global coherence sitting at its random floor, and whether the Hopf ODE is worth its weight."
date: 2026-06-24
series: Oscillators
status: draft
version: 1
author: Julian Fleck
tags:
  - phase
---

> [!note] Internal
> The open questions behind [[oscillators]] and [[oscillators/implementation]]. The first one is, I think, the one to settle before the membrane work leans on phase at all — it's a clean dimensionality-reduction question, well suited to a math-first look.

## The complexity-reduction problem (look here first)

The phase seeding is **enormously lossy.** `initialize_oscillator()` collapses a high-dimensional embedding to a single angle on a circle (see [[oscillators/implementation]]), and that destroys almost all of its structure: unrelated frames collide at the same phase often, and the angle itself is arbitrary. "Similar phase ≈ similar meaning" holds only weakly. Worse, the natural frequency ω and the initial phase θ₀ are two *independent* random shadows of the same vector, correlated only through the source embedding.

This is the worry worth taking seriously before anything is built on phase. **If the project is about high-dimensional spread collapsing, compressing each frame to one angle before the dynamics even start may throw away exactly what we want to watch.** The research direction that motivated the oscillator wanted a phase *signature* — several dimensions — not a scalar.

So the prior question is sharp and measurable: does a low-dimensional phase signature (a handful of angles, or a small torus) preserve enough of the embedding geometry to make synchronization mean something, where a single angle doesn't? Quantify what survives the collapse at d = 1, 2, 4, … — how well phase distance at each d tracks full-embedding similarity — and the curve says whether the oscillator is even reading the right quantity. This gates whether phase belongs in the membrane path at all. Collected with the other scalar-collapse problems in [[codebase-improvements]].

## Global coherence is close to meaningless

The order parameter over *all* frames, seeded at semantically spread phases, sits near its random-phase floor (≈ 1/√N) and barely moves regardless of local dynamics. Coherence is only informative over a bounded population — it should be read **per [[membranes|membrane]]**, where a region tightening is a real, local event. The global number averages out the thing it's meant to detect. This is the claim [[membranes/experiments]] tests directly: per-region coherence should separate planted clusters where the global parameter can't.

## Is the ODE worth its weight

Is the full Hopf oscillator worth its weight versus a scalar activation plus a coherence read straight off embedding geometry? For the membrane task specifically, [[membranes/metrics]] argues the boundary needs the coupling layer, not the oscillator — so the oscillator has to justify itself as an instrument for *synchronization dynamics* (whether a phase signal *leads* visible failure), not as plumbing for boundaries. Whether it clears that bar is open, and the cleaner the answer to the complexity-reduction question above, the sharper this one gets.

<Related tags="phase" />
