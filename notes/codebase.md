---
title: State of the codebase
definition: RAGE has had two versions — v1 (Recursive Agentic Graph Embeddings), the production graph construction behind recurse.cc and the subject of the companion paper; and v2 (Recursive Attention-Guided Explorations), the current dynamics testbed, now being modularized so we can experiment over different metrics.
description: The two versions of RAGE — the production graph builder behind recurse.cc and the attention-driven dynamics testbed — what each does, and what in the dynamics layer is still to build.
date: 2026-06-22
series: Lab notes
status: draft
version: 2
author: Julian Fleck
tags:
  - implementation
internal: true
show: true
---

RAGE, the technology used for some of what we describe here, has had two lives. The first — *Recursive Agentic Graph Embeddings* — is the production system behind [recurse.cc](https://www.recurse.cc/): it builds a frame-semantic knowledge graph out of documents and serves it to users. What that system can do is written up in the companion paper, *[[graph-construction]]*.

The second version came out of getting interested in what happens to such a graph under sustained use — its dynamics. So RAGE became *Recursive Attention-Guided Explorations*: a separate, lighter testbed, rebuilt to move quickly and watch the substrate behave. That is where the work in these notes happens, and the near-term plan is to modularize it so we can swap in and compare different metrics over the same substrate.

## What the testbed already does

- builds the typed [[frame]] graph, with named slots and frames nesting inside frames;
- records [[coupling]] between frames, including whether a pairing reinforces or conflicts — its valence;
- gives each frame an activation that decays over time and a phase, so attention and rhythm are first-class rather than bolted on (the [[hopf-oscillators|oscillator layer]]);
- retrieves by a mix of keywords and meaning, and can walk the graph along its own structure;
- streams its changes live, so the substrate can be watched as it moves rather than polled after the fact.

A caveat on how much of that is joined up. The activation-and-phase layer and the [[coupling]] layer are wired in one direction only: coupling drives the oscillators (frames used together are pulled toward the same rhythm), but the oscillators don't yet feed back — a frame's phase and activation tilt what retrieval surfaces, not what the substrate stores. So the rhythm reads the substrate; it doesn't yet shape it. The detail is in the [[hopf-oscillators]] note.

## What isn't built yet

The dynamics layer these notes describe is still mostly ahead of the code. The building blocks above are the foundation for it:

- reading the dynamics across a whole population of agents, not one frame at a time;
- [[membranes]] as boundaries computed from the substrate's own state, rather than fixed access rules — the data to draw them (coupling density) is there, but nothing yet emits the boundary or reads metrics over it;
- coherence read where it means something. Today it's computed over the whole substrate at once, which averages out the local synchrony that matters; it needs to be read per [[membranes|membrane]];
- acting on what's detected — today a conflict is recorded as coupling valence, but nothing responds to it: an interfering pairing currently pulls frames together the same as an aligning one;
- many agents reading from and writing to the same substrate at once;
- some of the [[gini-coefficient|metrics]] ([[hill-diversity|diversity]], concentration, convergence) are not computed yet. The data needed to compute them is there; the read-outs are not.

So the building blocks are real and observable live; the dynamics and the metrics these notes explore are the work ahead, and the next step is making the testbed modular enough to run those experiments.

The concrete deltas between what those concept notes describe and what the code actually does — and the proposed changes to close them — are collected in [[codebase-improvements]].
