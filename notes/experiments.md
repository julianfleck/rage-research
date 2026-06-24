---
title: Experiments
definition: The experiments index — small, fully observable runs that validate substrate signals, each with its own setup note under experiments/. A mechanism earns a place only after it shows a measurable, reproducible effect on a controlled problem; a signal counts only if it precedes the visible failure with a usable lead and beats trace-level baselines.
description: Index of substrate-validation experiments — each a small, fully observable run with its own setup note. Membrane detection is the first specified; attractor onset, decay against collapse, contamination, and cross-hierarchy coherence are candidates still to be written up.
date: 2026-06-15
series: Experiments
status: draft
version: 2
author: Julian Fleck
tags:
  - validation
show: true
---

Small, fully observable runs that validate substrate signals — each gets its own setup note under `experiments/`. A mechanism earns a place only after it shows a measurable, reproducible effect on a small, controlled problem; a substrate signal counts if it precedes the visible failure with a usable lead and beats trace-level baselines, tested at small scale first.

## Specified

- [[membranes/experiments|Membrane detection]] — draw membranes from a planted substrate and score recovery against ground truth, comparing the candidate designs from [[membranes/metrics]]. The measurement instrument several of the candidates below rely on. *(owner: Megan)*

## Candidates

A first pass, still to be aligned with the team and written up as their own setups:

- **Phase representation** — does a low-dimensional phase *signature* preserve enough embedding geometry to make synchronization mean something, where a single angle doesn't? Quantify what survives the collapse at d = 1, 2, 4, … against full-embedding similarity. A clean dimensionality-reduction study, and arguably the one to run *before* phase is trusted anywhere downstream (see [[oscillators/questions]]). *(candidate owner: Megan)*
- **Attractor onset** — repeated similarity-driven write-back over a fixed corpus; does [[frame-type-diversity|diversity]] decline and [[coupling]] concentration lead the visible output repetition?
- **Decay against collapse** — drive co-retrieval to a tight [[membranes|membrane]], stop, and let decay run; do long-tail frames re-enter the default context without erasing the learned coherence?
- **Contamination propagation** — seed one wrong frame; is the contaminated region identifiable from substrate state before outputs visibly degrade?
- **Coherence across hierarchies** — do higher-order frames stay consistent with their constituents under write-back, and how deep does the consistency reach?

Cross-cutting all of them: every result is conditional on the embedding model that seeds initial positions — a sensitivity study of its own.
