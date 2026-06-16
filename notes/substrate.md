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

The *substrate* is the shared [[frame]]-graph medium a population of agents reads from and writes back into. What makes it a substrate rather than a static scaffold is the write-back feedback: each write reshapes what other agents retrieve on the next turn, so the medium conditions what can be thought next.

<Figure id="substrate-slice" margin caption="Each retrieval strikes a different chord: an agent pulls a particular configuration of frames — a subgraph — out of the substrate; the next turn pulls another." />

Treated this way, the store is not a record but an active medium — its topology, vocabulary, and traversal behaviour all evolve with use. That is what makes its [[coordination-phase|dynamics]] worth studying, and a harder object to reason about with static graph theory alone. The rest of these notes are about what sustained, two-way use does to such a medium.

<Related tags="structure" />
