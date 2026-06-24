---
title: Membranes / Implementation
internal: true
show: true
definition: "What it actually takes to establish a membrane over the substrate — a density measure, a boundary-drawing step, a release mechanism, and a read over the boundary — what of that is built today, and why the oscillator is mostly orthogonal to all four."
description: "The implementation status behind membranes: the four things establishing a membrane requires, which are built and which aren't, and the argument that drawing a boundary needs the coupling layer, not the oscillator."
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
> One of the [[membranes]] working notes — this one covers *what establishing a membrane takes* and what of it is wired today. The companions are [[membranes/metrics]] (the candidate measurement methods), [[membranes/experiments]] (where they get tested), and [[membranes/questions]] (what's left open). It asks a blunt question the [[oscillators]] work raised: how much of the current machinery a membrane actually needs.

## What establishing a membrane actually requires

From the [[membranes]] definition, a membrane is a temporary, semi-permeable boundary drawn around a co-active region by [[coupling]] density. To establish one you need four things:

1. **A density measure over regions** — which frames are bound more tightly to each other than to their surroundings. Coupling strengths in the `couplings` table already give this.
2. **A boundary-drawing step** — take that density and emit a membrane: a set of frames with an inside and an outside. This must allow **overlap and nesting**, not a partition (a frame can be in two membranes; one membrane can sit inside another). *Not built.* There's no routine that turns coupling density into a boundary.
3. **A release mechanism** — membranes dissolve as their region falls dormant. Bifurcation decay gives this on the activation side; coupling decay gives it on the structure side.
4. **A read over the boundary** — coherence, diversity, permeability computed over the enclosed subgraph. *Mostly not built* — coherence exists but only globally (see [[oscillators/implementation]]), diversity isn't computed.

The gap is items 2 and 4: drawing an overlapping/nested boundary, and reading metrics over a subgraph. Item 1 is largely there; item 3 partly.

## The oscillator is mostly orthogonal to it

Here's the claim worth testing. **None of the four requirements needs the oscillator to draw the boundary.** Density (1) comes from co-attention coupling, which never touches `z`. The boundary (2) is a graph problem over coupling strength. Release (3) can run off coupling decay alone. The oscillator contributes to (4) — phase-coherence as one possible read over a membrane — and offers an alternative signal of co-activity (synchronization) that we could draw boundaries from instead of density. But it is not what the boundary rests on.

So the substantial investment in Hopf dynamics is, for the membrane task specifically, a **parallel track**: it gives a candidate readout and a candidate release clock, not the thing that picks out the region. That's worth saying plainly before building more on top of it — and it's why the oscillator gets its own questions in [[oscillators/questions]], separate from the membrane path.

The two roles should be kept separate in the build: a membrane layer that draws and reads boundaries from coupling, and a dynamics layer that studies synchronization over them. Coupling them prematurely is what makes the current code read as more joined-up than it is. The candidate methods for the membrane layer are worked through in [[membranes/metrics]].

<Related tags="membrane" />
