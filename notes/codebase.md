---
title: State of the codebase
definition: The frame-graph construction exists twice — Recurse (production, over Neo4j) and rage-substrate (a lighter SQLite rewrite that moved ahead on the frame model, a pushed event stream, and spatial addressing). The plan is to converge them into one pipeline and a modular dynamics layer.
description: Where the implementation stands — Recurse vs rage-substrate, what each is ahead on, and the two-way migration toward one construction pipeline and a modular dynamics layer.
date: 2026-06-15
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - implementation
show: true
---

The frame-semantic graph construction currently exists **twice**, and the two copies have diverged. The original implementation, **[Recurse](https://www.recurse.cc/)**, is production-grade: a five-stage extraction pipeline emitting to Neo4j, dual embeddings, hybrid search, a multi-tenant REST API. When the dynamics work started, those production requirements made it hard to iterate, so a lighter implementation — **rage-substrate**, over SQLite — was rewritten to move faster. It is architecturally ahead in three places: a cleaner [[frame]] model, a WebSocket event stream that *pushes* substrate events (you cannot observe [[resonance]] by polling), and an overhauled spatial addressing scheme.

The migration goes both ways: port the newer model and event stream back into Recurse so the production graph becomes observable in real time, then run the dynamics experiments over that hardened graph. The end state is one construction pipeline and one modular dynamics layer, talking through a defined protocol.
