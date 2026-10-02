---
title: Observing Dynamics over Self-Governing Graphs
description: What happens to a frame-semantic knowledge graph once a population of agents continuously reads from and writes back into it.
date: 2026-06-11
series: Articles
order: 2
show: true
preview: false
status: draft
version: 1
author: Julian Fleck
tags:
  - dynamics
internal: true
---

Companion to the paper *Frame-Semantic Graph Construction for Knowledge Substrates*. This piece ties the substrate-dynamics notes into one picture: a [[substrate]] built of [[frame|frames]] that a population of agents continuously reads from and writes back into, what sustained use by that whole population does to it, what can be read off it before behaviour fails, and how to intervene on the medium rather than on the agents.

## Terms

Each term has its own note; the glosses below are the short form.

- [[frame|Frame]] — a typed knowledge unit with named slots, instantiated from content (not a fixed ontology); frames nest.
- [[substrate|Substrate]] — the shared frame-graph medium a population reads from and writes back into; the write-back feedback is what makes it a substrate rather than a static scaffold.
- [[coupling|Coupling]] — a connection between frames that strengthens when they are retrieved and acted on together (Hebbian) and relaxes otherwise; carries a valence.
- [[membranes|Membrane]] — a boundary over a densely co-activated region; interventions act on membranes, not on agents.
- [[divergence-convergence-cycle|Coordination regime]] — exploration, stabilization, lock-in, or drift within a task-relative cycle.
- [[divergence-convergence-cycle|Divergence/convergence cycle]] — the healthy oscillation between opening the space and closing it; the pathologies are cycle failures.

## The frame graph

The substrate is a frame-semantic knowledge graph: typed [[frame|frame]] instances with named slots, composing recursively along a structural axis (paragraph → section → document) and a semantic axis (claim + evidence + source → argument). That recursion lets the graph be read across [[scale|scales]]. Three properties make it self-governing rather than merely self-updating: structure is discovered rather than imposed, the type registry is negotiated at ingestion time, and frames carry their own traversal instructions.

The consequence for dynamics research: the graph is not a passive data structure that dynamics get bolted onto. Its topology, vocabulary, and traversal behavior all evolve with use — which makes it the right object for studying what sustained multi-agent use does to a shared knowledge medium, and a harder object to reason about with static graph theory alone.

<Figure id="substrate-slice" margin caption="Each retrieval strikes a different chord: an agent pulls a particular configuration of frames — a subgraph — out of the substrate; the next turn pulls another." />

## Coordination phase

The [[divergence-convergence-cycle|coordination regime]] describes how a population is moving through a shared substrate. The internal [[dynamics-research#Coordination regimes|dynamics note]] retains the more granular operating model of exploration, stabilization, lock-in, and drift.

![[divergence-convergence-cycle#The cycle]]

What counts as healthy is task-relative and cannot be read from one metric. The [[measurement-research|measurement note]] keeps the internal work on diversity and concentration; the [[membrane-research|membrane note]] covers boundary-level intervention.

## What we can read

<Figure id="type-drift" margin caption="Homogenization drift: frames arrive varied and collapse toward a single dominant type as write-back concentrates." />

Diversity is one read; concentration is its dual. Hill numbers describe the effective number of types and Gini summarizes unevenness, but neither means anything on its own. The internal [[measurement-research]] note keeps the definitions and validation guardrails together.

## Validation

Validation begins with small, fully observable experiments. The current internal backlogs live with the mechanisms they test in [[dynamics-research#Experiment backlog|Dynamics research]] and [[membrane-research#Validation plan|Membrane research]]. A signal earns its place only if it precedes visible failure with usable lead time and beats simpler baselines.
