---
title: State of the codebase
definition: The frame-graph construction exists twice — Recurse (production, over Neo4j) and rage-substrate (the experimental testbed, over SQLite, where the dynamics primitives live). The substrate-dynamics layer and its metrics are mostly not built yet; rage-substrate provides the foundation.
description: Where the implementation stands — Recurse vs rage-substrate, the dynamics primitives that already work in the testbed, and the substrate-dynamics layer and metrics that are still aspirational.
date: 2026-06-15
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - implementation
show: true
---

The frame-semantic graph construction exists **twice**, and the two copies share no code. **[Recurse](https://www.recurse.cc/)** (`rage-backend`) is the production product — it builds the graph for users. **rage-substrate** is the research testbed, where the dynamics primitives live and the substrate-dynamics work happens. Most of what these notes describe is a research programme over rage-substrate, not yet a running system.

## The split

|                | Recurse (`rage-backend`)                     | rage-substrate                                        |
| -------------- | -------------------------------------------- | ----------------------------------------------------- |
| Construction   | OpenAI structured outputs → Pydantic → Neo4j | LLM tool calls → recursive [[frame]] nesting → SQLite |
| Storage        | Neo4j (graph + vector indexes)               | SQLite (local-first, FTS5)                            |
| Dynamics       | none — static embeddings, no decay           | attention, decay, per-frame phase, [[coupling]]       |
| Frame registry | dynamic (hot-reload, auto-discovery)         | static defaults                                       |
| Maturity       | production                                   | experimental                                          |

## What rage-substrate already has

Working and tested:

- a typed [[frame]] model — content-addressed IDs, named slots, parent hierarchy, activation tracking;
- [[coupling]] as explicit edges carrying strength and a **valence** (alignment / interference / neutral) with event counts;
- per-frame attention and decay (a Hopf / Stuart–Landau oscillator) and per-frame phase (Kuramoto-style);
- hybrid retrieval (BM25 + semantic fusion, entity-first, reranking) and recursive graph traversal;
- territories (semantic namespaces with membership), v3 addressing, and a WebSocket event stream that *pushes* substrate events.

## What isn't built yet

The substrate-dynamics layer is mostly aspirational — the primitives above are the foundation it would be built on:

- **population-level phase** — per-frame Kuramoto/Hopf works; collective synchronization does not;
- **[[membranes]] as computed permeability** — today there are only static ACLs and territory membership, not phase-signature-based boundaries;
- **divergence interventions** — interference is detected in coupling valence, but nothing acts on it;
- **multi-agent coordination** — single-user today, with creator/owner tracking but no write-back across agents or schema negotiation;
- **the metrics themselves** — convergence measurement, [[gini-coefficient|Gini]] concentration, and [[hill-diversity|Hill diversity]] are *not computed yet*. The phase and coupling data needed to compute them exists; the read-outs do not.

So the honest summary: the substrate's primitives are real and observable in real time, and the dynamics and metrics these notes explore are the work ahead.
