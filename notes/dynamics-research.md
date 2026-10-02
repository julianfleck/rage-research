---
title: Dynamics research
definition: Internal working account of coordination regimes, the deprecated oscillator model, task-relative interpretation, and the experiment backlog.
description: Consolidated internal note covering coordination phase, oscillator implementation and questions, calibration, and dynamics experiments.
date: 2026-10-02
series: Lab notes
order: 21
status: draft
version: 1
author: Substrate Dynamics Lab
tags: [dynamics, oscillators, experiments]
internal: true
show: true
---

> [!note] Internal
> This note consolidates the former coordination-phase, oscillator, task-appropriate behavior, fractal-composition, and experiment-backlog notes. The public account lives in [[movement]], [[divergence-convergence-cycle|Divergence/convergence cycle]], and [[scale|Scale]]. The source notes are preserved under `TRASH/notes/`.

## Coordination regimes

The working model distinguishes four regimes. They describe a population's movement through the substrate, not a frame's oscillator phase.

| Regime | Working description |
|---|---|
| Exploration | Active regions expand, alternatives enter, and couplings form and dissolve |
| Stabilization | Useful relationships persist and the active field narrows deliberately |
| Lock-in | Concentrated retrieval repeatedly returns the population to the same configurations |
| Drift | Activity continues without enough consolidation to support action |

These labels are task-relative. A narrow routine task may call for fast stabilization; an open research problem may require prolonged exploration. No scalar threshold can label a regime without the task, its stakes, the declared grain, and the time window.

## Archived oscillator model

The earlier implementation represented each frame as a Hopf oscillator with a complex state, amplitude, and phase. Attention moved a frame across the bifurcation into oscillation; decay let it fall dormant; coupling pulled active frames toward synchronization.

Hopf dynamics were chosen over phase-only oscillators because frames needed to become inactive, and over amplitude-only scores because the model was intended to retain timing. Embeddings seeded natural frequency and initial phase; amplitude and the initial bifurcation value were fixed.

The implementation joined the layers in only one direction:

- coupling strength affected oscillator synchronization;
- oscillator state did not affect coupling;
- recorded coupling valence did not change the oscillator interaction sign;
- global coherence averaged away local structure.

The public account no longer depends on this representation. It remains a research instrument only if a phase-based readout outperforms simpler measurements over the same [[membranes|membrane]].

## Questions that decide whether phase is useful

1. How much semantic structure survives projection from a high-dimensional embedding into one phase angle?
2. Does a multi-dimensional phase signature preserve more useful geometry?
3. Does per-region phase coherence distinguish conditions that embedding tightness and coupling density miss?
4. Does closing the feedback loop improve prediction, or merely add a harder-to-interpret mechanism?
5. Can the same effect be reproduced with a cheaper discrete update rule?

## Scale and composition

The recurring compositional pattern remains useful: smaller units participate in larger contexts, which can sometimes be treated as units at the next grain. The stronger claim that frames, actors, and [[membranes]] are the same kind of object has been dropped. Every reading must state which object is being measured and at what scale.

## Experiment backlog

- **Phase representation.** Compare one angle and low-dimensional phase signatures with the full embedding geometry.
- **Attractor onset.** Test whether diversity loss and coupling concentration precede visible repetition under repeated write-back.
- **Decay against collapse.** Drive activity into a tight [[membranes|membrane]], stop reinforcement, and test whether neglected material becomes reachable again.
- **Contamination propagation.** Seed one wrong frame and test whether the affected region becomes legible before outputs degrade.
- **Coherence across hierarchy.** Test whether higher-order frames remain consistent with their constituents under write-back and how the signal changes with depth.

These are research directions, not current commitments or assigned work. Each needs a preregistered setup, a trace-level baseline, and a criterion for usable lead time.

<Related tags="dynamics, oscillators, experiments" />
