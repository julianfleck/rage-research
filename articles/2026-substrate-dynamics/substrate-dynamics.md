---
title: Observing Dynamics over Self-Governing Graphs
description: What happens to a frame-semantic knowledge graph once a population of agents continuously reads from and writes back into it.
date: 2026-06-11
series: Articles
order: 2
show: true
status: draft
version: 1
author: Julian Fleck
tags: [substrate, dynamics]
---

Companion to the paper *Frame-Semantic Graph Construction for Knowledge
Substrates*. The motivation is substrate-level signals that precede behavioral
failure, and reversible interventions on the medium rather than the agents — so
these notes skip the why and give a picture of what is implemented, where the
implementation is split, and what could be built next.

## Terms

- **Frame** — the primitive: a typed knowledge unit with named slots, instantiated from content (not from a fixed ontology). A frame can be a sentence-level claim or a whole document; frames nest.
- **Substrate** — the shared frame-graph medium a population of agents reads from and writes back into. What makes it a substrate rather than a static scaffold is the write-back feedback: each write reshapes what other agents retrieve on the next turn.
- **Coupling** — a connection between frames that strengthens when they are retrieved and acted on together (Hebbian) and relaxes when they are not. Carries a valence: alignment, interference, or neutral.
- **Membrane** — a boundary region where context is densely co-activated, surrounded by sparser coupling. Membranes are where the substrate's influence is exercised: they modulate what context crosses into an agent's next turn. Interventions act on membranes, not on agents.
- **Coordination phase** — the dynamical regime a population of agents over the substrate currently occupies: exploration, stabilization, lock-in, or drift. "Phase" in the phase-transition sense, not the oscillator sense.
- **Divergence/convergence cycle** — the healthy oscillation between opening the space (divergence) and closing it around something usable (convergence). Pathologies are cycle failures: premature convergence (lock-in) or failure to converge (drift).

## The frame graph

The substrate is a frame-semantic knowledge graph: typed frame instances with named slots, composing recursively along a structural axis (paragraph → section → document) and a semantic axis (claim + evidence + source → argument support structure). Three properties make it self-governing rather than merely self-updating: structure is discovered rather than imposed, the type registry is negotiated at ingestion time, and frames carry their own traversal instructions.

The consequence for dynamics research: the graph is not a passive data structure that dynamics get bolted onto. Its topology, vocabulary, and traversal behavior all evolve with use — which makes it the right object for studying what sustained multi-agent use does to a shared knowledge medium, and a harder object to reason about with static graph theory alone.

<Chart id="20-substrate" caption="Semantic frame graph and substrate co-retrieval dynamics. Activation shown as heat; the active agent population works inside the membrane." />

## Coordination phase

**Coordination phase** is the regime a population of agents working over a shared substrate currently occupies — phase in the dynamical-systems sense (as in phase transition), not the oscillator sense. A frame's phase angle is a lower-level quantity; coordination phase is what we read off the population. Four candidate states:

- **Exploration** — active regions expanding, couplings forming and dissolving, frame-type diversity rising
- **Stabilization** — couplings consolidating around structures that are proving useful; diversity narrowing deliberately
- **Lock-in** — coupling so concentrated that retrieval keeps returning the same configurations; new content arrives but cannot compete
- **Drift** — couplings decaying without consolidation; activity without accumulation

None of these states is a failure by itself. Healthy work **cycles**: divergence opens the space, convergence closes it around something usable, and the cycle repeats at every scale. The pathologies are cycle failures — premature convergence (collapse into lock-in before exploration has done its job) or the inability to converge at all (drift). And what counts as healthy is **role-relative**: a brainstorming agent should spend most of its time in exploration, a verification agent in stabilization. There is no universal healthy profile, only a match or mismatch between the substrate's phase and the role and stakes of the task.

**The operating loop.** The substrate is not queried once and then left alone. On every agent turn it assembles and injects the context that turn will run on — and that injection point is the leverage. Membranes modulate what crosses in: which frames are pulled, which are held back, which contradicting or long-tail frames are deliberately mixed in. Raising coupling promotes convergence; widening the aperture promotes divergence. Reading phase and acting on it happen at the same point: the per-turn assembly of context.

## Frame-type diversity

![[frame-type-diversity]]

## State of the codebase

The frame-semantic graph construction currently exists **twice**, and the two copies have diverged. The original implementation, **Recurse**, is production-grade: a five-stage extraction pipeline emitting to Neo4j, dual embeddings, hybrid search, a multi-tenant REST API. When the dynamics work started, those production requirements made it hard to iterate, so a lighter implementation — **rage-substrate**, over SQLite — was rewritten to move faster. It is architecturally ahead in three places: a cleaner frame model, a WebSocket event stream that *pushes* substrate events (you cannot observe resonance by polling), and an overhauled spatial addressing scheme.

The migration goes both ways: port the newer model and event stream back into Recurse so the production graph becomes observable in real time, then run the dynamics experiments over that hardened graph. The end state is one construction pipeline and one modular dynamics layer, talking through a defined protocol.

## Validation: minimal experiments

A mechanism earns a place only after it shows a measurable, reproducible effect on a small, fully observable problem. A substrate signal counts if it precedes the visible failure with a usable lead and beats trace-level baselines — tested at small scale first.

- **Attractor onset** — repeated similarity-driven write-back over a fixed corpus; does diversity decline and coupling concentration lead the visible output repetition?
- **Decay against collapse** — drive co-retrieval to a tight cluster, stop, and let decay run; do long-tail frames re-enter the default context without erasing the learned coherence?
- **Contamination propagation** — seed one wrong frame; is the contaminated region identifiable from substrate state before outputs visibly degrade?
- **Coherence across hierarchies** — do higher-order frames stay consistent with their constituents under write-back, and how deep does the consistency reach?

Cross-cutting all four: every result is conditional on the embedding model that seeds initial positions — a sensitivity study of its own.
