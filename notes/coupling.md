---
title: Coupling
definition: A weighted connection between two frames that strengthens when they are retrieved and acted on together (Hebbian) and relaxes when they are not. Coupling carries a valence — alignment, interference, or neutral — and its density over a region is what a membrane is drawn around.
description: Coupling in substrate dynamics — the slow, Hebbian connection between frames that carries a valence (alignment, interference, neutral), accumulates the history of use, and whose density defines membranes.
date: 2026-06-14
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - substrate
  - coupling
  - structure
show: true
---

In substrate dynamics, *coupling* is a weighted connection between two frames. It is built by co-activation: frames retrieved and acted on together strengthen the coupling between them (Hebbian), and it relaxes when they go unused. Coupling is the slow variable — distinct from the fast activation that flashes through the graph and fades in moments. It accumulates over many turns, so it is where the substrate keeps the memory of what has been used together.

<Figure id="coupling-propagation" margin caption="Activation propagating along couplings, with the membrane left out: each shared firing builds coupling and draws co-active frames closer together." />

## Valence

Coupling is not only a magnitude. It carries a **valence** — the quality of the connection, not just its strength:

- **Alignment** — the two frames reinforce each other; working with them together holds up, and the coupling records that they belong together.
- **Interference** — the two pull against each other; co-use produces friction or contradiction, and the coupling records the conflict rather than a bond.
- **Neutral** — they co-occur without either reinforcing or conflicting.

Valence is what lets the substrate tell productive structure from accreted conflict: two regions can be equally densely coupled and mean opposite things, and a metric blind to valence would read them the same.

Frame semantics give a handle on this. Because frame-graph construction makes the relationship between frames explicit in their slots, valence can be read off that structure rather than guessed: two tightly coupled regions may carry information on the same subject and be complementary — their slots fit together — or conflicting — their slots disagree. So coupling strength says two frames are used together; the slot relationship says whether using them together aligns or interferes.

## Relation to membranes and resonance

Coupling density over a region is what a [[membranes|membrane]] is drawn around — the dense neighbourhood set off against the sparser coupling outside. And coupling is one of the two ingredients of [[resonance]]: the history of use, which resonance reads against the semantic coherence of the current content. Coupling is the structure; resonance is how that structure is read at retrieval.

## Open problems

- How reliably slot relationships infer valence, and whether the three kinds should build and decay on the same clock.
- How pairwise coupling aggregates into the density a membrane is read from.
- The timescale separation between activation and coupling — tuned so structure neither freezes into a permanent attractor nor decays before it can form.

<Related tags="coupling, substrate, membrane" />
