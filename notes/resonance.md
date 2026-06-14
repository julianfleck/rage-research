---
title: Resonance
definition: How strongly a recipient couples to a region of the substrate when it retrieves from it — the coupling already built across that region (Hebbian) weighted by how well it coheres with what the recipient is doing. Resonance sets how deep a retrieval traverses into a subgraph: low resonance returns the summary at the top, high resonance lets the recipient navigate in and pull a rich subset of frames.
description: Resonance in substrate dynamics — Hebbian coupling weighted by semantic coherence — and how it sets the traversal depth, and so the granularity, of what a retrieval returns.
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

In substrate dynamics, *resonance* is how strongly a recipient couples to a region of the substrate when it retrieves from it. It has two ingredients: the coupling already built across that region — Hebbian, accumulated by co-activation over time — and the semantic coherence between the recipient's current frames and the region's content. Coupling carries the history of use; coherence carries the fit right now. Resonance is the two together, which is why a region a recipient has worked before *and* that matches what it is doing now resonates most.

What resonance regulates is **traversal depth**. A retrieval doesn't return a fixed slice; how far it reaches into a subgraph scales with resonance. Low resonance returns only the parent-level summary over a subgraph — the coarse view. As resonance rises, the recipient is allowed to navigate in and pull a richer subset of the frames below, down to fine detail. So resonance is the knob behind granularity: it sets how coarse or fine the retrieved context is (see [[fractal-composition]]).

This is the quantity a [[membranes|membrane]]'s channels gate. The membrane is the boundary; resonance is what has to cross a threshold for a channel to open, and how far past the threshold it crosses is how deep the retrieval reaches. Permeability, depth, and granularity are the same gate read at different grains.

## Open questions

- The function that combines coupling and coherence into a single resonance value — product, weighted sum, something with a threshold of its own — is unsettled.
- Whether resonance is best read per-edge, per-frame, or per-subgraph, and how those aggregate.
- How resonance relates to the [[frame-type-diversity|variety]] a membrane admits: depth and breadth may trade off, or move together.

<Related tags="resonance, substrate, membrane" />
