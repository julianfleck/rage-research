---
title: Observing Dynamics over Self-Governing Graphs
description: What happens to a frame-semantic knowledge graph once a population of agents continuously reads from and writes back into it.
date: 2026-06-11
series: Articles
order: 2
show: false
status: draft
version: 1
author: Julian Fleck
tags: [dynamics]
---

Companion to the paper *Frame-Semantic Graph Construction for Knowledge Substrates*. This piece ties the substrate-dynamics notes into one picture: a [[substrate]] built of [[frame|frames]] that a population of agents continuously reads from and writes back into, what sustained two-way use does to it, what can be read off it before behaviour fails, and how to intervene on the medium rather than on the agents. Each mechanism has its own note; this is the synthesis that links them. Where the implementation currently stands is its own note too — see [[codebase|state of the codebase]].

## Terms

Each term has its own note; the glosses below are the short form.

- [[frame|Frame]] — a typed knowledge unit with named slots, instantiated from content (not a fixed ontology); frames nest.
- [[substrate|Substrate]] — the shared frame-graph medium a population reads from and writes back into; the write-back feedback is what makes it a substrate rather than a static scaffold.
- [[coupling|Coupling]] — a connection between frames that strengthens when they are retrieved and acted on together (Hebbian) and relaxes otherwise; carries a valence.
- [[membranes|Membrane]] — a boundary over a densely co-activated region; interventions act on membranes, not on agents.
- [[coordination-phase|Coordination phase]] — the regime the population currently occupies: exploration, stabilization, lock-in, or drift.
- [[divergence-convergence-cycle|Divergence/convergence cycle]] — the healthy oscillation between opening the space and closing it; the pathologies are cycle failures.

## The frame graph

The substrate is a frame-semantic knowledge graph: typed [[frame|frame]] instances with named slots, composing recursively along a structural axis (paragraph → section → document) and a semantic axis (claim + evidence + source → argument). That recursion is the same compositional move at every level — [[fractal-composition|frames nesting into frames]] — so the graph can be read across [[scale|scales]], and a [[membranes|membrane]] drawn at one scale behaves as a frame at the next. Three properties make it self-governing rather than merely self-updating: structure is discovered rather than imposed, the type registry is negotiated at ingestion time, and frames carry their own traversal instructions.

The consequence for dynamics research: the graph is not a passive data structure that dynamics get bolted onto. Its topology, vocabulary, and traversal behavior all evolve with use — which makes it the right object for studying what sustained multi-agent use does to a shared knowledge medium, and a harder object to reason about with static graph theory alone.

<Figure id="substrate-slice" margin caption="Each retrieval strikes a different chord: an agent pulls a particular configuration of frames — a subgraph — out of the substrate; the next turn pulls another." />

## Coordination phase

[[coordination-phase|Coordination phase]] is the regime a population of agents working over a shared substrate currently occupies — phase in the dynamical-systems sense (as in phase transition), not the oscillator sense. A frame's [[resonance|phase angle]] is a lower-level quantity; coordination phase is what we read off the population. Four candidate states:

![[coordination-phase#The states]]

![[divergence-convergence-cycle#The cycle]]

![[coordination-phase#The operating loop]]

Both halves of that loop run on machinery the notes cover. What counts as healthy is read from [[coupling]] density and its valence and from [[frame-type-diversity|frame-type diversity]]; what gets acted on is the [[membranes|membrane]], whose permeability — a threshold on [[resonance]] — sets how much, and how deep, the context that crosses in is.

## What we can read

![[frame-type-diversity#^read-out]]

![[frame-type-diversity#^drift]]

<Figure id="type-drift" margin caption="Homogenization drift: frames arrive varied and collapse toward a single dominant type as write-back concentrates." />

Diversity is one read; concentration is its dual. We measure the spread as an effective number of types ([[hill-diversity|Hill diversity]]) and the unevenness of coupling as a single coefficient ([[gini-coefficient|Gini]]), and we read both at every [[scale]]. Neither number means anything on its own — each is a signal only against what the task should produce ([[task-appropriate-behavior|task-appropriate behaviour]]).

## Validation

How any of this gets validated is a separate, still-forming list — a handful of small, fully observable [[experiments|minimal experiments]], to be aligned on with the team. A signal earns its place only if it precedes the visible failure with a usable lead and beats trace-level baselines.
