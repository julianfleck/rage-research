---
title: Terms
description: Short definitions of the terms that recur across these notes.
date: 2026-06-12
series: References
order: 3
show: true
status: draft
version: 1
author: Julian Fleck
tags: [reference]
---
## Substrate

- **Substrate** — the shared frame-graph medium a population of agents reads from
  and writes back into. What makes it a substrate rather than a static scaffold is
  the write-back feedback: each write reshapes what other agents retrieve on the
  next turn.
- **Coupling** — a connection between frames that strengthens when they are
  retrieved and acted on together (Hebbian) and relaxes when they are not. Carries
  a valence: alignment, interference, or neutral.
- **[[membranes|Membrane]]** — a dynamically adjusted boundary over a densely
  co-activated region of frames and the agents retrieving over them, surrounded by
  sparser coupling. At a given step it delineates a co-working population of agents
  and their active context from the rest of the substrate. Membranes **nest and
  overlap** rather than partition — membranes over membranes — so a membrane is a
  boundary you draw at a moment, not a fixed group. Membranes are where the
  substrate's influence is exercised — they modulate what context crosses into an
  agent's next turn — so interventions act on membranes, not on agents.
- **Coordination phase** — the dynamical regime a population of agents over the
  substrate currently occupies: exploration, stabilization, lock-in, or drift.
  "Phase" in the phase-transition sense, not the oscillator sense.
- **Divergence/convergence cycle** — the healthy oscillation between opening the
  space (divergence) and closing it around something usable (convergence).
  Pathologies are cycle failures: premature convergence (lock-in) or failure to
  converge (drift).

## Construction

- **Frame** — the primitive: a typed unit of knowledge with named slots filled from
  content. A frame can be as small as a sentence-level claim or as large as a whole
  document, and frames nest.
- **Frame type (schema)** — the template a frame instantiates: a named kind of
  knowledge unit (`claim`, `evidence`, `method`, …) declaring which slots to expect
  and what may fill them. Types live in a registry, not in application code.
- **Slot** — a named, typed relationship on a frame, expecting a particular filler
  (a frame of some type, or a literal). Typed slots make the graph queryable by
  structure, not only by similarity; an unfilled slot carries a default and marks
  what is missing.
- **Relationship (edge)** — a typed link between frames (`SUPPORTS`, `CONTRADICTS`,
  `HAS_CHILD`, …), assigned as frames are extracted and grounded in the frame
  type's own expectations.
- **Composition** — frames combine along two axes: **structurally** (paragraph →
  section → document) and **semantically** (claim + evidence + source → argument
  support structure). Semantic composition may cross document boundaries.
- **Registry** — the store of frame type and operation definitions, itself held as
  frames on the graph. It is self-extending: new types can be proposed at
  extraction time.
- **Traversal instruction** — the navigation semantics a frame type carries through
  its slot structure: which relationships it expects, and toward which types. The
  same per-type expectations that lay down edges also guide how the graph is later
  traversed.

## From the notes

Pulled automatically from each note's `definition` — hover a link for the full note.

<Definitions />
