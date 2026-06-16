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

AI is increasingly deployed not as isolated chatbots but as populations of agents that read from and write back into a shared medium — the memory, context, retrieval, and tool state each agent works through. That medium is the *substrate*. What makes it a substrate rather than a static scaffold is the write-back: each write reshapes what every other agent retrieves on the next turn, so the medium conditions what can be done next.

Failure in such a system tends to be collective, and to surface in the medium before it surfaces in any one agent's output — a population converges too early, a local error is retrieved back as evidence and amplified, the shared store drifts without resolving. So the questions we follow are whether the substrate carries early, measurable signals of coordination health and emerging failure — signals that precede an individual agent's behavioural expression of it — and whether reversible interventions on the medium can restore healthy coordination without overriding the agents themselves. The aim is oversight that scales with the size and depth of a deployment instead of being outpaced by it.

The word is borrowed from ecology, where a substrate is the medium an organism lives in and grows on — soil, a reef, the culture in a dish. We mean it that way: knowledge here is treated as a living system, not a static record. Frames and the agents working over them grow, couple, and decay; regions flourish or go fallow; boundaries form and dissolve as the population works. Much of the vocabulary in these notes — membranes, coupling, resonance, decay — keeps that ecological sense, and it is meant literally.

<Figure id="substrate-slice" margin caption="Each retrieval strikes a different chord: an agent pulls a particular configuration of frames — a subgraph — out of the substrate; the next turn pulls another." />

We carry this out over a [[frame]]-graph: a typed medium of composable, nested units, so the same structure can be read across [[scale|scales]]. Treated this way the store is not a record but an active medium — its topology, vocabulary, and traversal behaviour all evolve with use, which is what makes its [[coordination-phase|dynamics]] worth studying, and a harder object to reason about with static graph theory alone. The rest of these notes are about what sustained, two-way use does to such a medium.

<Related tags="structure" />
