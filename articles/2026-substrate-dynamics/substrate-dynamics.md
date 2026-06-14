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
tags: [dynamics]
---

Companion to the paper *Frame-Semantic Graph Construction for Knowledge
Substrates*. The motivation is substrate-level signals that precede behavioral
failure, and reversible interventions on the medium rather than the agents — so
these notes skip the why and give a picture of what is implemented, where the
implementation is split, and what could be built next.

## Terms

Each term has its own note; the glosses below are the short form.

- [[frame|Frame]] — a typed knowledge unit with named slots, instantiated from content (not a fixed ontology); frames nest.
- [[substrate|Substrate]] — the shared frame-graph medium a population reads from and writes back into; the write-back feedback is what makes it a substrate rather than a static scaffold.
- [[coupling|Coupling]] — a connection between frames that strengthens when they are retrieved and acted on together (Hebbian) and relaxes otherwise; carries a valence.
- [[membranes|Membrane]] — a boundary over a densely co-activated region; interventions act on membranes, not on agents.
- [[coordination-phase|Coordination phase]] — the regime the population currently occupies: exploration, stabilization, lock-in, or drift.
- [[divergence-convergence-cycle|Divergence/convergence cycle]] — the healthy oscillation between opening the space and closing it; the pathologies are cycle failures.

## The frame graph

The substrate is a frame-semantic knowledge graph: typed frame instances with named slots, composing recursively along a structural axis (paragraph → section → document) and a semantic axis (claim + evidence + source → argument support structure). Three properties make it self-governing rather than merely self-updating: structure is discovered rather than imposed, the type registry is negotiated at ingestion time, and frames carry their own traversal instructions.

The consequence for dynamics research: the graph is not a passive data structure that dynamics get bolted onto. Its topology, vocabulary, and traversal behavior all evolve with use — which makes it the right object for studying what sustained multi-agent use does to a shared knowledge medium, and a harder object to reason about with static graph theory alone.

<Figure id="frame-graph" margin caption="A frame-semantic graph under co-retrieval: a query lights a connected region of typed frames, and a membrane forms around the ones in play." />

## Coordination phase

[[coordination-phase|Coordination phase]] is the regime a population of agents working over a shared substrate currently occupies — phase in the dynamical-systems sense (as in phase transition), not the oscillator sense. A frame's [[resonance|phase angle]] is a lower-level quantity; coordination phase is what we read off the population. Four candidate states:

![[coordination-phase#The states]]

![[divergence-convergence-cycle#The cycle]]

![[coordination-phase#The operating loop]]

## Frame-type diversity

![[frame-type-diversity#^read-out]]

![[frame-type-diversity#^drift]]

<Figure id="type-drift" margin caption="Homogenization drift: frames arrive varied and collapse toward a single dominant type as write-back concentrates." />

## State of the codebase

The frame-semantic graph construction currently exists **twice**, and the two copies have diverged. The original implementation, **Recurse**, is production-grade: a five-stage extraction pipeline emitting to Neo4j, dual embeddings, hybrid search, a multi-tenant REST API. When the dynamics work started, those production requirements made it hard to iterate, so a lighter implementation — **rage-substrate**, over SQLite — was rewritten to move faster. It is architecturally ahead in three places: a cleaner frame model, a WebSocket event stream that *pushes* substrate events (you cannot observe resonance by polling), and an overhauled spatial addressing scheme.

The migration goes both ways: port the newer model and event stream back into Recurse so the production graph becomes observable in real time, then run the dynamics experiments over that hardened graph. The end state is one construction pipeline and one modular dynamics layer, talking through a defined protocol.

## Validation: minimal experiments

A mechanism earns a place only after it shows a measurable, reproducible effect on a small, fully observable problem. A substrate signal counts if it precedes the visible failure with a usable lead and beats trace-level baselines — tested at small scale first.

- **Attractor onset** — repeated similarity-driven write-back over a fixed corpus; does diversity decline and coupling concentration lead the visible output repetition?
- **Decay against collapse** — drive co-retrieval to a tight membrane, stop, and let decay run; do long-tail frames re-enter the default context without erasing the learned coherence?
- **Contamination propagation** — seed one wrong frame; is the contaminated region identifiable from substrate state before outputs visibly degrade?
- **Coherence across hierarchies** — do higher-order frames stay consistent with their constituents under write-back, and how deep does the consistency reach?

Cross-cutting all four: every result is conditional on the embedding model that seeds initial positions — a sensitivity study of its own.
