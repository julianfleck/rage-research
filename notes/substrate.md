---
title: Substrate
definition: The shared medium a population of agents reads from and writes back into — memory, context, retrieval, and tool state — where each write reshapes what every other agent retrieves next. The write-back feedback is what makes it a substrate rather than a static scaffold.
description: What the substrate is — the shared medium of memory, context, retrieval, and tool state a population of agents reads from and writes back into, treated as an active medium whose structure evolves with use rather than a static record.
date: 2026-06-15
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - structure
show: true
---

A *substrate* is the shared medium a population of agents reads from and writes back into — their memory, context, retrieval, and tool state. AI is increasingly deployed this way: populations of agents over a common medium, not isolated chatbots. Its defining property is the write-back loop: each write feeds back into the medium, changing what can be retrieved on the next turn. That loop holds for any dynamic knowledge base — a single agent and a store already have it — but our interest is the second-order effects it produces as use accumulates, which a population sharing the medium makes both larger and harder to see.

<Figure id="substrate-slice" margin caption="Each retrieval strikes a different chord: an agent pulls a particular configuration of frames — a subgraph — out of the substrate; the next turn pulls another." />

Multi-agent systems have a class of failures that are collective — properties of the population, not of any single agent: premature convergence on a narrow region before exploration is complete; a local error propagating as others retrieve it as evidence and amplify it; failure to converge at all. Two open questions follow: whether the substrate carries early, measurable signals of such failure — signals that would precede any single agent's behavioural expression of it; and whether reversible interventions on the medium can restore healthy coordination without overriding the agents. The aim: oversight that scales with the size and depth of a deployment rather than being outpaced by it.

We borrow the term from ecology: the medium an organism lives in and grows on, soil or a reef or a culture in a dish. Knowledge in a knowledge substrate is treated the same way: as living system, not a record. Frames and the agents over them grow, couple, and decay; regions flourish or go fallow; boundaries form and dissolve. The recurring vocabulary — membrane, coupling, resonance, decay — keeps that ecological sense, and is meant literally.

We build the substrate as a [[frame]]-graph: typed units that compose and nest, so the same structure reads across [[scale|scales]]. Built this way, the store is an active medium, not a record — topology, vocabulary, and traversal behaviour all evolve with use. Its [[coordination-phase|dynamics]] are the object of study, and a poor fit for static graph theory. The rest of these notes concern what sustained use by a whole population does to such a medium.

<Related tags="structure" />
