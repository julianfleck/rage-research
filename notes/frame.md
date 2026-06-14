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

The slots are what make the structure legible. Each slot is named, and its filler is itself a frame — so a slot is an edge in the graph, and following slots is how composition and traversal work. An observation, for instance, points at its source and the frames it relates to and supports, each slot an edge into the graph:

```json
{
  "id": "/research/llm-memory",
  "type": "observation",
  "content": "LLMs struggle with long-context recall.",
  "slots": {
    "source": "paper:arxiv/2401.12345",
    "related": ["/research/attention-mechanisms"],
    "supports": "/research/claim-1"
  }
}
```

Because a frame carries its type and slots explicitly, the relationship between two frames is legible in their structure, not only in their proximity in embedding space. That is what lets [[coupling]] carry a valence — alignment or interference, not just strength — and it is the material a [[membranes|membrane]] is ultimately drawn over.

## Types

The registry runs to around forty types; a representative few:

| Type | Holds |
|------|-------|
| `observation` | raw facts, notes, things noticed |
| `claim` | an assertion that could be true or false |
| `insight` | synthesized understanding |
| `decision` | a choice made, with its rationale |
| `question` | an open question or uncertainty |
| `territory` | a container for related frames |
| `collection` | a grouping without spatial semantics |

The registry is not fixed: in Recurse it is discovered and hot-reloaded at ingestion; in rage-substrate it is a static default set. Either way it is a working vocabulary, not a closed ontology.

<Related tags="frame, structure" />
