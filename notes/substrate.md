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

AI is increasingly deployed not as isolated chatbots but as populations of agents that read from and write back into a shared medium — the memory, context, retrieval, and tool state each agent works through. That medium is the *substrate*. What makes it a substrate rather than a static scaffold is a write-back loop: each write back into the medium reshapes what every other agent potentially retrieves on the next turn, so the medium conditions any future action.

<Figure id="substrate-slice" margin caption="Each retrieval strikes a different chord: an agent pulls a particular configuration of frames — a subgraph — out of the substrate; the next turn pulls another." />

Multi-agent systems have a class of failures that are collective — they belong to the population rather than to any one agent: premature convergence on a narrow region before exploration is complete; the propagation of a local error as other agents retrieve it as evidence and amplify it; or a failure to converge at all, exploration continuing without consolidating. These are the failures we follow. The open questions are whether the substrate carries early, measurable signals of them — signals that would precede any individual agent's behavioural expression of failure — and whether reversible interventions on the medium can restore healthy coordination without overriding the agents themselves. The aim is oversight that scales with the size and depth of a deployment instead of being outpaced by it.

The word is borrowed from ecology, where a substrate is the medium an organism lives in and grows on — soil, a reef, the culture in a dish. We mean it that way: knowledge here is treated as a living system, not a static record. Frames and the agents working over them grow, couple, and decay; regions flourish or go fallow; boundaries form and dissolve as the population works. Much of the vocabulary in these notes — membranes, coupling, resonance, decay — keeps that ecological sense, and it is meant literally.

We carry this out over a [[frame]]-graph: a typed medium of composable, nested units, so the same structure can be read across [[scale|scales]]. Treated this way the store is not a record but an active medium — its topology, vocabulary, and traversal behaviour all evolve with use, which is what makes its [[coordination-phase|dynamics]] worth studying, and a harder object to reason about with static graph theory alone. The rest of these notes are about what sustained use by a whole population does to such a medium.

<Related tags="structure" />