---
title: Membrane research
definition: Internal working account of how membranes are drawn, measured, tested, and used as intervention surfaces.
description: Consolidated internal note covering membrane implementation, measurement methods, experiments, and open questions.
date: 2026-10-02
series: Lab notes
order: 20
status: draft
version: 1
author: Substrate Dynamics Lab
tags: [membrane, measurement, experiments]
internal: true
show: true
---

> [!note] Internal
> This note consolidates the former membrane implementation, metrics, experiments, and questions notes. The public definition remains [[membranes|Membranes]]. The source notes are preserved under `TRASH/notes/membranes/`.

## Research object

A [[membranes|membrane]] is a temporary boundary around a co-active region. The operational problem is to draw that boundary from observed interaction structure, read useful quantities over it, and test whether acting at the boundary changes later dynamics.

Four parts are required:

1. **A regional density measure.** Which frames are bound more tightly to one another than to their surroundings?
2. **A boundary-drawing method.** The result must allow overlap and nesting rather than forcing a partition.
3. **A release condition.** A boundary should dissolve as the activity and coupling that sustain it decay.
4. **Measurements over the region.** Coherence, diversity, permeability, and recovery are properties of a declared region and time window.

Coupling density can support the first three without an oscillator. Phase dynamics may still provide a useful read over a boundary, but they do not have to define the boundary itself.

## Methods under comparison

### Coupling community

Start from activation and the weighted coupling graph, then find overlapping connected or community regions. This is the simplest baseline because the boundary comes directly from observed co-use. It needs an explicit overlap rule and a decay or release threshold.

### Embedding geometry

Draw or score regions using tightness in semantic space. This can detect semantic coherence that coupling alone may miss, but it is conditional on the embedding model and can confuse topical similarity with interaction structure.

### Phase coherence

Read synchronization over an already drawn region. The global phase order parameter is expected to sit near its random floor when several local regions coexist, so coherence must be read per [[membranes|membrane]]. The phase arm earns its complexity only if it separates conditions that coupling density and embedding tightness cannot.

The gating question is therefore direct: **does phase add explanatory or predictive value over the simpler coupling and embedding baselines?**

## Validation plan

Use small synthetic substrates with planted, overlapping regions before moving to real corpora. Sweep overlap, bridge density, region size, noise, and retrieval strategy while keeping the ground truth known.

| Quantity | Comparison | Positive result |
|---|---|---|
| Global phase order | Random floor | Stays near the floor when local regions coexist |
| Per-region coherence | Global order and random floor | Separates planted regions without averaging them away |
| Embedding tightness | Per-region phase coherence | Adds signal where phase does not |
| Recovery | Drawn versus planted regions | High overlap-aware recovery that degrades gradually as overlap rises |
| Coupling-source sensitivity | Dense, hybrid, and graph-walk retrieval | Shows how retrieval policy changes the boundary being measured |

The coupling-community and embedding baselines are implemented in the lab. The phase comparison still depends on the dynamics pass. Real-embedding fixtures are available, but designed synthetic fixtures remain the first validation tier because they retain known ground truth.

## Open questions

- Which overlapping-community method preserves nesting without producing unstable boundaries?
- Which coherence estimator best distinguishes local organization from global averaging?
- How should recovery be scored when both planted and detected regions overlap?
- What amount of resonance should change permeability, and how should that threshold depend on the task?
- How should permeability itself be measured: crossings, admitted variety, downstream use, or some combination?
- How sensitive are the results to the embedding model, retrieval strategy, grain, and time window?
- Do membrane-level signals anticipate later failure with enough lead time to support a reversible intervention?

<Related tags="membrane, measurement, experiments" />
