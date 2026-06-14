---
title: Resonance
definition: A measure on the substrate that combines the coupling frames have built by use (Hebbian) with their semantic coherence. Resonant units are retrieved together — a retrieval is a threshold on resonance, and lowering the threshold reaches deeper into a subgraph, returning finer detail. Concretely it is a setting in the re-ranker.
description: Resonance in substrate dynamics — Hebbian coupling combined with semantic coherence — read through a retrieval threshold that sets how deep, and so how granular, a retrieval goes.
date: 2026-06-14
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - substrate
  - resonance
  - retrieval
show: true
---

In substrate dynamics, *resonance* is a measure on the substrate itself, not on any reader: how strongly a set of frames belongs together. It has two ingredients — the coupling already built across them (Hebbian, accumulated by co-activation over time) and the semantic coherence of their content. Coupling carries the history of use; coherence carries the fit of meaning. Resonance is the two together, which is why frames that have been worked together *and* are about the same thing resonate most.

What resonance does is set what gets retrieved together. A retrieval gathers the units whose resonance clears a threshold — resonant units come back as a group. Held high, the threshold returns only the most resonant: the coarse summary at the top of a subgraph. Lowered, retrieval reaches deeper and more of the detail below clears the bar, down to fine grain. So resonance, read through a threshold, is the knob behind granularity — how coarse or fine the retrieved context is (see [[fractal-composition]]). Concretely, the threshold is a setting in the re-ranker.

There is no privileged recipient in this. It does not matter whether what retrieves is an agent, a person, a document, or a set of instructions — the same resonance is read, the same threshold applies. This is the quantity a [[membranes|membrane]]'s channels gate: the membrane is the boundary, the threshold on resonance is what opens a channel, and how far the threshold drops is how deep retrieval reaches. Permeability, depth, and granularity are the same gate read at different grains.

## Open problems

- The function that combines coupling and coherence into a single resonance value — product, weighted sum, something with a threshold of its own — is unsettled.
- Whether resonance is best read per-edge, per-frame, or per-subgraph, and how those aggregate.
- How resonance relates to the [[frame-type-diversity|variety]] a retrieval admits: depth and breadth may trade off, or move together.

<Related tags="resonance, substrate, membrane" />
