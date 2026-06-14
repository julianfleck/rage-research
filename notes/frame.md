---
title: Frame
definition: The primitive of the substrate — a typed knowledge unit with named slots, instantiated from content rather than drawn from a fixed ontology. A frame can be a sentence-level claim or a whole document, and frames nest.
description: What a frame is in substrate dynamics — the typed, slotted primitive the graph is built from, whose slots are the graph's edges, instantiated from content and nesting across scales.
date: 2026-06-15
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - frame
  - structure
show: true
---

In substrate dynamics, a *frame* is the primitive unit: a typed knowledge unit with named slots, instantiated from content rather than drawn from a fixed ontology. A frame can be as small as a sentence-level claim or as large as a whole document, and frames nest — a claim sits inside a section, a section inside a document, the same composition repeating across scales (see [[fractal-composition]]).

<Figure id="frame-slots" margin caption="A frame is a typed box with named slots; a slot's value is another frame, so slots are the graph's edges and frames nest." />

The slots are what make the structure legible. Each slot is named and typed, and its filler is itself a frame — so a slot is an edge in the graph, and following slots is how composition and traversal work. A claim, for instance, carries its support inline, each slot pointing at another frame:

```yaml
# a Claim frame — every slot's value is another frame
Claim:
  text:     "Hebbian coupling concentrates retrieval over time."
  evidence: [ Observation#diversity-decline, Observation#repetition ]
  source:   Source#doshi-hauser-2024
  supports: Argument#homogenization-drift
```

Because a frame carries its type and slots explicitly, the relationship between two frames is legible in their structure, not only in their proximity in embedding space. That is what lets [[coupling]] carry a valence — alignment or interference, not just strength — and it is the material a [[membranes|membrane]] is ultimately drawn over.

## Common types

| Type | Typical slots | Holds |
|------|---------------|-------|
| Claim | subject, predicate, evidence, source | an assertion with its support |
| Entity | name, kind, attributes | a thing referred to |
| Event | actor, action, object, time | something that happened |
| Argument | thesis, claims, rebuttals | a structure of supporting claims |
| Document | title, sections, source | a whole source, nesting everything under it |
| Source | author, work, locator | the provenance a claim points back to |

The registry is not fixed: types are negotiated at ingestion rather than imposed, so this set is a working vocabulary, not a closed ontology.

<Related tags="frame, structure" />
