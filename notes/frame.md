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

The slots are what make the structure legible. Each slot is named, and its filler is itself a frame — so a slot is an edge in the graph, and following slots is how composition and traversal work. What the names buy is *discursive* structure: a slot records the role one frame plays for another — the claim being made, the evidence for it, the objection it has to answer — not merely that two frames are connected. An argument nests the claim it asserts, the examples that ground it, the references behind those, and the objection it must meet:

```json
{
  "id": "arg/long-context-unreliable",
  "type": "argument",
  "content": "Long-context recall isn't reliable enough to depend on yet.",
  "slots": {
    "claim": {
      "type": "claim",
      "content": "Recall accuracy degrades as the context window grows."
    },
    "evidence": [
      {
        "type": "example",
        "content": "On a needle-in-a-haystack test, accuracy fell off past ~32k tokens.",
        "slots": { "reference": "paper:arxiv/2407.01437" }
      }
    ],
    "objection": {
      "type": "rebuttal",
      "content": "Retrieval augmentation recovers most of the accuracy back."
    }
  }
}
```

Any labeled-property graph can say two nodes are *related*; the work here is in the slot names saying *how* — `claim`, `evidence`, `objection` — so the edges carry the shape of the reasoning, not just adjacency. Because a frame carries its type and slots explicitly, the relationship between two frames is legible in their structure, not only in their proximity in embedding space. That is what lets [[coupling]] carry a valence — alignment or interference, not just strength — and it is the material a [[membranes|membrane]] is ultimately drawn over.

## Frames and membranes

A membrane is drawn over frames, but it is not quite a frame itself. A frame's schema is *declared* — a type and named slots, fixed before it is filled, its edges pointing at specific frames. A membrane has none of that: it is a population held together by [[coupling]], composed by co-activation rather than by named slots. What stands in for its schema is *induced* — the fingerprint we measure over it: type spread, coupling structure, phase coherence. So the two are commensurable, not identical. The same mechanics and metrics run over both — the legibility we want — but a frame *is* a composition where a membrane *composes*. The bridge is crystallization: a membrane that recurs and stabilizes can be collapsed to a point and its schema induced from its population — then matched to an existing frame type, or promoted to a new one in the registry below. Same substance at two phases — declared structure and emergent structure — convertible one direction.

## Types

The registry runs to around forty types; a representative few:

| Type          | Holds                                    |
| ------------- | ---------------------------------------- |
| `observation` | raw facts, notes, things noticed         |
| `claim`       | an assertion that could be true or false |
| `insight`     | synthesized understanding                |
| `decision`    | a choice made, with its rationale        |
| `question`    | an open question or uncertainty          |
| `collection`  | a grouping without spatial semantics     |

The registry is not fixed: in rage-substrate it is a static default set. Either way it is a working vocabulary, not a closed ontology.

<Related tags="frame, structure" />
